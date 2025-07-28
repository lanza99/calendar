import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { EventFormComponent, CalendarEvent } from '../event-form/event-form.component';
import { ConfirmationModalComponent } from '../ConfirmationModalComponent/confirmation-modal.component';

@Component({
  selector: 'app-month',
  standalone: true,
  imports: [CommonModule, EventFormComponent, ConfirmationModalComponent],
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css']
})
export class MonthComponent implements OnInit, OnChanges {
  @Input() baseDate?: Date;
  weeks: Date[][] = [];
  events: CalendarEvent[] = [];
  selectedEvent?: CalendarEvent;
  selectedEventDate?: Date;
  showForm = false;

  showConfirm = false;
  pendingDeleteEvent?: CalendarEvent;

  constructor(private eventSvc: EventService) {}

  ngOnInit() {
    if (!this.baseDate) this.baseDate = new Date();
    this.buildCalendar();
    this.loadEvents();
  }

  ngOnChanges() {
    if (!this.baseDate) this.baseDate = new Date();
    this.buildCalendar();
    this.loadEvents();
  }

  private buildCalendar() {
    const y = this.baseDate!.getFullYear();
    const m = this.baseDate!.getMonth();
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7;
    let cur = new Date(y, m, 1 - offset);
    this.weeks = [];
    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      this.weeks.push(week);
    }
  }

  loadEvents() {
    this.eventSvc.getAllEvents()
      .then(ev => this.events = ev);
  }

  eventsForDay(day: Date): CalendarEvent[] {
    const dayUTC = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
    return this.events.filter(e => {
      const start = new Date(Date.UTC(e.startDate.getFullYear(), e.startDate.getMonth(), e.startDate.getDate()));
      const end = new Date(Date.UTC(e.endDate.getFullYear(), e.endDate.getMonth(), e.endDate.getDate()));
      switch (e.recurrence) {
        case 'none': return dayUTC >= start && dayUTC <= end;
        case 'daily': return dayUTC >= start;
        case 'weekly': return dayUTC.getUTCDay() === start.getUTCDay() && dayUTC >= start;
        case 'monthly': return dayUTC.getUTCDate() === start.getUTCDate() && dayUTC >= start;
        case 'yearly': return dayUTC.getUTCDate() === start.getUTCDate() &&
                              dayUTC.getUTCMonth() === start.getUTCMonth() &&
                              dayUTC >= start;
        default: return false;
      }
    });
  }

  openNew() {
    this.selectedEvent = undefined;
    this.showForm = true;
  }

openDetail(ev: CalendarEvent, date?: Date) {
  console.log('[DEBUG openDetail] clicked event:', ev);
  console.log('[DEBUG openDetail] clicked date:', date);
  this.selectedEvent = ev;
  this.selectedEventDate = date ? new Date(date) : new Date();
  this.showForm = true;
}



deleteSelected(event?: CalendarEvent) {
  console.log('[DEBUG deleteSelected] Avviato per evento:', event);
  if (event) this.selectedEvent = event;
  if (!this.selectedEvent) return;

  if (this.selectedEvent.recurrence !== 'none') {
    this.showConfirm = true;
  } else {
    // eliminazione evento non ricorrente diretta
    this.eventSvc.deleteEvent(this.selectedEvent.id)
      .then(() => this.loadEvents())
      .then(() => {
        this.selectedEvent = undefined;
        this.selectedEventDate = undefined;
      });
  }
}

onDeleteSingle() {
  console.log('[DEBUG onDeleteSingle] Eliminazione singola occorrenza avviata');
  console.log('[DEBUG onDeleteSingle] selectedEvent:', this.selectedEvent);
  console.log('[DEBUG onDeleteSingle] selectedEventDate:', this.selectedEventDate);
  if (!this.selectedEventDate || !this.selectedEvent) return;

  const ev = this.selectedEvent;
  const occDate = this.selectedEventDate;
  const start = new Date(ev.startDate);
  const end = new Date(ev.endDate);

  // Funzioni helper
  const prevOccurrenceDate = (date: Date, recurrence: string): Date => {
    const prev = new Date(date);
    if (recurrence === 'daily') prev.setDate(prev.getDate() - 1);
    if (recurrence === 'weekly') prev.setDate(prev.getDate() - 7);
    if (recurrence === 'monthly') prev.setMonth(prev.getMonth() - 1);
    if (recurrence === 'yearly') prev.setFullYear(prev.getFullYear() - 1);
    return prev;
  };

  const nextOccurrenceDate = (date: Date, recurrence: string): Date => {
    const next = new Date(date);
    if (recurrence === 'daily') next.setDate(next.getDate() + 1);
    if (recurrence === 'weekly') next.setDate(next.getDate() + 7);
    if (recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
    if (recurrence === 'yearly') next.setFullYear(next.getFullYear() + 1);
    return next;
  };

  if (occDate.getTime() === start.getTime()) {
    ev.startDate = nextOccurrenceDate(occDate, ev.recurrence || 'none');
  } else if (occDate.getTime() === end.getTime()) {
    ev.endDate = prevOccurrenceDate(occDate, ev.recurrence || 'none');
  } else {
    const newEvent: CalendarEvent = { ...ev, id: Math.random().toString(36).substring(2, 15) };
    newEvent.startDate = nextOccurrenceDate(occDate, ev.recurrence || 'none');
    newEvent.endDate = end;
    ev.endDate = prevOccurrenceDate(occDate, ev.recurrence || 'none');

    this.eventSvc.addEvent(newEvent);
  }

  this.eventSvc.updateEvent(ev)
    .then(() => this.loadEvents())
    .then(() => {
      this.selectedEvent = undefined;
      this.selectedEventDate = undefined;
      this.showConfirm = false;
    });
}

onDeleteSeries() {
  console.log('[DEBUG onDeleteSeries] Eliminazione intera serie avviata');
  if (!this.selectedEvent) return;
  this.eventSvc.deleteEvent(this.selectedEvent.id)
    .then(() => this.loadEvents())
    .then(() => {
      this.selectedEvent = undefined;
      this.selectedEventDate = undefined;
      this.showConfirm = false;
    });
}

onCancelModal() {
  console.log('[DEBUG onCancelModal] Chiusura modale conferma');
  this.showConfirm = false;
}


  saveEvent(ev: CalendarEvent) {
    if (this.selectedEvent) {
      this.eventSvc.updateEvent(ev)
        .then(() => this.loadEvents());
    } else {
      this.eventSvc.addEvent(ev)
        .then(() => this.loadEvents());
    }
    this.closeForm();
  }

  closeForm() {
    this.selectedEvent = undefined;
    this.selectedEventDate = undefined;
    this.showForm = false;
  }
}
