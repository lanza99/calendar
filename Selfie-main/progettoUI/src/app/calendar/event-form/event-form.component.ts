import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  luogo?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  reminderMinutes: number;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  color: string;
  assegnati?: string[];
  partecipazioni?: { utente: string; stato: 'accettato' | 'rifiutato' | 'in_attesa' }[];
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnChanges {
  @Input() formData?: CalendarEvent;
  @Output() newEvent = new EventEmitter<CalendarEvent>();
  @Output() updateEvent = new EventEmitter<CalendarEvent>();
  @Output() deleteEvent = new EventEmitter<CalendarEvent>();
  @Output() formClosed = new EventEmitter<void>();

  form: FormGroup;
  isEditMode = false;
  isActivityMode = false;

  hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      title:           ['', Validators.required],
      description:     [''],
      luogo:           [''],
      startDate:       [this.today(), Validators.required],
      endDate:         [this.today(), Validators.required],
      allDay:          [false],
      startHour:       ['00'],
      startMinute:     ['00'],
      endHour:         ['00'],
      endMinute:       ['00'],
      reminderMinutes: [0, [Validators.min(0)]],
      recurrence:      ['none', Validators.required],
      color:           ['#6f42c1', Validators.required],
      assegnati:       ['']
    });

    this.form.get('allDay')?.valueChanges.subscribe(val => {
      ['startHour', 'startMinute', 'endHour', 'endMinute'].forEach(control => {
        if (val) this.form.get(control)?.disable();
        else this.form.get(control)?.enable();
      });
    });
  }

 ngOnChanges() {
  if (this.formData) {
    this.isEditMode = true;

    // Rileva se è un'attività (assenza di startTime come discriminante)
    this.isActivityMode = !this.formData.startTime && !this.formData.endTime;

    const [sh, sm] = this.formData.startTime?.split(':') || ['00', '00'];
    const [eh, em] = this.formData.endTime?.split(':') || ['00', '00'];

    this.form.patchValue({
      title: this.formData.title,
      description: this.formData.description || '',
      luogo: this.formData.luogo || '',
      startDate: this.formData.startDate,
      endDate: this.formData.endDate,
      allDay: this.formData.allDay,
      startHour: sh,
      startMinute: sm,
      endHour: eh,
      endMinute: em,
      reminderMinutes: this.formData.reminderMinutes,
      recurrence: this.formData.recurrence,
      color: this.formData.color,
      assegnati: (this.formData as any).assegnati || ''
    });

    // Disabilita i campi orari se "tutto il giorno"
    if (this.form.get('allDay')?.value) {
      this.form.get('startHour')?.disable();
      this.form.get('startMinute')?.disable();
      this.form.get('endHour')?.disable();
      this.form.get('endMinute')?.disable();
    }
  } else {
    this.resetForm();
  }
}


  switchToEvento() {
    this.isActivityMode = false;
    this.resetForm();
  }

  switchToAttivita() {
    this.isActivityMode = true;
    this.resetForm();
  }

  submit() {
    if (this.form.invalid) return;
    const f = this.form.value;

    if (this.isActivityMode) {
      const payload = {
        titolo: f.title,
        descrizione: f.description,
        dataScadenza: f.endDate,
        assegnati: f.assegnati.split(',').map((x: string) => x.trim()),
        creatore: 'utente1'
      };
      this.http.post('http://localhost:8080/attivita', payload).subscribe(() => this.close());
      return;
    }

    const startTime = f.allDay ? undefined : `${f.startHour}:${f.startMinute}`;
    const endTime   = f.allDay ? undefined : `${f.endHour}:${f.endMinute}`;

    const toSave: CalendarEvent = {
      id: this.isEditMode && this.formData ? this.formData.id : this.generateId(),
      title: f.title,
      description: f.description,
      luogo: f.luogo,
      startDate: new Date(f.startDate),
      endDate: new Date(f.endDate),
      allDay: f.allDay,
      startTime: startTime,
      endTime: endTime,
      reminderMinutes: +f.reminderMinutes,
      recurrence: f.recurrence,
      color: f.color,
      assegnati: f.assegnati ? f.assegnati.split(',').map((x: string) => x.trim()) : []
    };

    if (this.isEditMode) {
      this.updateEvent.emit(toSave);
    } else {
      this.newEvent.emit(toSave);
    }
    this.close();
  }

  cancel() {
    this.close();
  }

  delete() {
    if (!this.formData) return;
    this.deleteEvent.emit(this.formData);
    this.close();
  }

  private close() {
    this.resetForm();
    this.isEditMode = false;
    this.formData = undefined;
    this.formClosed.emit();
  }

  private resetForm() {
    this.form.reset({
      title: '',
      description: '',
      luogo: '',
      startDate: this.today(),
      endDate: this.today(),
      allDay: false,
      startHour: '00',
      startMinute: '00',
      endHour: '00',
      endMinute: '00',
      reminderMinutes: 0,
      recurrence: 'none',
      color: '#6f42c1',
      assegnati: ''
    });

    ['startHour', 'startMinute', 'endHour', 'endMinute'].forEach(c => this.form.get(c)?.enable());
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private generateId() {
    return Math.random().toString(36).substring(2, 15);
  }
}
