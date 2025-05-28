import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';         // <— aggiunto
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService, CalendarEvent } from '../services/event.service';

@Component({
  selector: 'app-event-editor',
  standalone: true,
  imports: [
    CommonModule,           // <— per *ngIf
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.css'],
})
export class EventEditorComponent implements OnInit {
  form = this.fb.group({
    id: [''],
    title: [''],
    date: [''],
    allDay: [false],
    startTime: ['08:00'],
    endTime: ['09:00'],
    reminderMinutes: [0],
    recurrence: ['none'],
    color: ['#f48fb1']
  });
  editing = false;

  colors = ['#f48fb1', '#81d4fa', '#a5d6a7', '#ffe082', '#ce93d8'];
  recurrences = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

  constructor(
    private fb: FormBuilder,
    private svc: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.editing = true;
      this.svc.getEventById(id).then(ev => {
        if (ev) this.form.patchValue(ev);
      });
    }
  }

save() {
  // Estrai i valori del form in una variabile
  const fv = this.form.value;

  // Ricostruisci l'evento assicurandoti
  // che NON ci siano stringhe undefined o null
  const data: CalendarEvent = {
    id: fv.id || crypto.randomUUID(),
    title: fv.title  ?? '',      // mai null/undefined
    date: fv.date    ?? '',      // mai null/undefined
    allDay: fv.allDay ?? false,  // mai null/undefined
    startTime: fv.allDay
      ? undefined
      : fv.startTime ?? '00:00',
    endTime: fv.allDay
      ? undefined
      : fv.endTime   ?? '00:00',
    reminderMinutes: fv.reminderMinutes ?? 0,
    recurrence: fv.recurrence as CalendarEvent['recurrence'],
    color: fv.color ?? '#f48fb1',
    description: ''               // campo opzionale
  };

  const op = this.editing
    ? this.svc.updateEvent(data)
    : this.svc.addEvent(data);

  op.then(() => this.router.navigate(['calendar','month']));
}
}