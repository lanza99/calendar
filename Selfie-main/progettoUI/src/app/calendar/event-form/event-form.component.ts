import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

//
// 1) Definizione dell’interfaccia CalendarEvent
//
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;    // ISO “YYYY-MM-DD”
  endDate:   string;    // ISO “YYYY-MM-DD”
  allDay: boolean;
  startTime?: string;   // “HH:mm”
  endTime?:   string;   // “HH:mm”
  reminderMinutes: number;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  color: string;
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnChanges {
  @Input()  formData?: CalendarEvent;
  @Output() newEvent    = new EventEmitter<CalendarEvent>();
  @Output() updateEvent = new EventEmitter<CalendarEvent>();
  @Output() formClosed  = new EventEmitter<void>();

  form: FormGroup;
  isEditMode = false;

  // Ore e minuti per i dropdown
  hours   = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  constructor(private fb: FormBuilder) {
    // 2) Inizializza il form con valori di default (data = oggi)
    this.form = this.fb.group({
      title:           ['', Validators.required],
      description:     [''],
      startDate:       [this.today(), Validators.required],
      endDate:         [this.today(), Validators.required],
      allDay:          [false],
      startHour:       ['00'],
      startMinute:     ['00'],
      endHour:         ['00'],
      endMinute:       ['00'],
      reminderMinutes: [0, [Validators.min(0)]],
      recurrence:      ['none', Validators.required],
      color:           ['#6f42c1', Validators.required]
    });

    // 3) Se “allDay” è true → disabilita i campi orario
    this.form.get('allDay')?.valueChanges.subscribe(val => {
      if (val) {
        this.form.get('startHour')?.disable();
        this.form.get('startMinute')?.disable();
        this.form.get('endHour')?.disable();
        this.form.get('endMinute')?.disable();
      } else {
        this.form.get('startHour')?.enable();
        this.form.get('startMinute')?.enable();
        this.form.get('endHour')?.enable();
        this.form.get('endMinute')?.enable();
      }
    });
  }

  // 4) Se cambia @Input() formData, popola il form per modifica
  ngOnChanges() {
    if (this.formData) {
      this.isEditMode = true;
      // Split di startTime in ore e minuti
      const [sh, sm] = this.formData.startTime?.split(':') || ['00', '00'];
      // Split di endTime
      const [eh, em] = this.formData.endTime?.split(':') || ['00', '00'];

      this.form.patchValue({
        title:           this.formData.title,
        description:     this.formData.description || '',
        startDate:       this.formData.startDate,
        endDate:         this.formData.endDate,
        allDay:          this.formData.allDay,
        startHour:       sh,
        startMinute:     sm,
        endHour:         eh,
        endMinute:       em,
        reminderMinutes: this.formData.reminderMinutes,
        recurrence:      this.formData.recurrence,
        color:           this.formData.color
      });

      if (this.formData.allDay) {
        this.form.get('startHour')?.disable();
        this.form.get('startMinute')?.disable();
        this.form.get('endHour')?.disable();
        this.form.get('endMinute')?.disable();
      }
    } else {
      this.resetForm();
    }
  }

  // 5) Ottiene la data odierna in “YYYY-MM-DD”
  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // 6) Submit del form (crea o aggiorna)
  submit() {
    if (this.form.invalid) return;
    const f = this.form.value;

    // Componi startTime ed endTime solo se non allDay
    const startTime = f.allDay 
      ? undefined 
      : `${f.startHour}:${f.startMinute}`;
    const endTime = f.allDay
      ? undefined
      : `${f.endHour}:${f.endMinute}`;

    const toSave: CalendarEvent = {
      id: this.isEditMode && this.formData ? this.formData.id : this.generateId(),
      title:           f.title,
      description:     f.description,
      startDate:       f.startDate,
      endDate:         f.endDate,
      allDay:          f.allDay,
      startTime:       startTime,
      endTime:         endTime,
      reminderMinutes: +f.reminderMinutes,
      recurrence:      f.recurrence,
      color:           f.color
    };

    if (this.isEditMode) {
      this.updateEvent.emit(toSave);
    } else {
      this.newEvent.emit(toSave);
    }
    this.close();
  }

  // 7) Annulla e chiude il popup
  cancel() {
    this.close();
  }

  // 8) Chiude il form e resetta tutto
  private close() {
    this.resetForm();
    this.isEditMode = false;
    this.formData = undefined;
    this.formClosed.emit();
  }

  // 9) Ripristina i valori di default
  private resetForm() {
    this.form.reset({
      title:           '',
      description:     '',
      startDate:       this.today(),
      endDate:         this.today(),
      allDay:          false,
      startHour:       '00',
      startMinute:     '00',
      endHour:         '00',
      endMinute:       '00',
      reminderMinutes: 0,
      recurrence:      'none',
      color:           '#6f42c1'
    });
    this.form.get('startHour')?.enable();
    this.form.get('startMinute')?.enable();
    this.form.get('endHour')?.enable();
    this.form.get('endMinute')?.enable();
  }

  // 10) Genera un ID univoco per l’evento
  private generateId() {
    return Math.random().toString(36).substring(2, 15);
  }
}
