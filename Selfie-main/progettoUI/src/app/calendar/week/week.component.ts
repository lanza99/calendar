import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService }  from '../../services/event.service';
import { EventFormComponent, CalendarEvent } from '../event-form/event-form.component';

@Component({
  selector: 'app-week',
  standalone: true,
  imports: [CommonModule, EventFormComponent],
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.css']
})
export class WeekComponent implements OnInit, OnChanges {
  @Input() baseDate?: Date;

  days: Date[] = [];
  hours = Array.from({ length: 24 }, (_, i) => i);
  events: CalendarEvent[] = [];
  selectedEvent?: CalendarEvent;
  selectedEventDate?: Date;
  showForm = false;

  constructor(private eventSvc: EventService) {}

  ngOnInit() {
    if (!this.baseDate) {
      this.baseDate = new Date();
    }
    this.buildWeek();
    this.loadEvents();
  }
  ngOnChanges() {
    if (!this.baseDate) {
      this.baseDate = new Date();
    }
    this.buildWeek();
    this.loadEvents();
  }

  private buildWeek() {
    const dow = (this.baseDate!.getDay() + 6) % 7;
    const monday = new Date(this.baseDate!);
    monday.setDate(this.baseDate!.getDate() - dow);
    this.days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  loadEvents() {
    this.eventSvc.getAllEvents().then(ev => this.events = ev);
  }

eventsForSlot(day: Date, h: number): CalendarEvent[] {
  const slotStart = new Date(day);
  slotStart.setHours(h, 0, 0, 0);
  const slotEnd = new Date(day);
  slotEnd.setHours(h + 1, 0, 0, 0);

  const results = this.events.filter(e => {
    const baseStartDate = new Date(e.startDate);
    const baseEndDate = new Date(e.endDate);

    // Calcola la differenza di settimane dal baseStartDate al giorno corrente
    const diffDays = Math.floor((day.getTime() - baseStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksSinceStart = Math.floor(diffDays / 7);

    // Calcola la data di occorrenza per eventi ricorrenti
    let eventStart = new Date(baseStartDate);
    let eventEnd = new Date(baseEndDate);

    switch (e.recurrence) {
      case 'weekly':
        if (weeksSinceStart < 0) return false; // futuro non ancora arrivato
        eventStart.setDate(baseStartDate.getDate() + weeksSinceStart * 7);
        eventEnd.setDate(baseEndDate.getDate() + weeksSinceStart * 7);
        break;
      case 'daily':
        if (diffDays < 0) return false;
        eventStart.setDate(baseStartDate.getDate() + diffDays);
        eventEnd.setDate(baseEndDate.getDate() + diffDays);
        break;
      case 'monthly':
        if (day < baseStartDate) return false;
        eventStart.setMonth(day.getMonth());
        eventStart.setFullYear(day.getFullYear());
        eventEnd.setMonth(day.getMonth());
        eventEnd.setFullYear(day.getFullYear());
        break;
      case 'yearly':
        if (day < baseStartDate) return false;
        eventStart.setFullYear(day.getFullYear());
        eventEnd.setFullYear(day.getFullYear());
        break;
      case 'none':
        // no recurrence, keep dates as is
        break;
    }

    // Applica orari
    if (e.startTime) {
      const [sh, sm] = e.startTime.split(':').map(Number);
      eventStart.setHours(sh, sm, 0, 0);
    } else {
      eventStart.setHours(0,0,0,0);
    }

    if (e.endTime) {
      const [eh, em] = e.endTime.split(':').map(Number);
      eventEnd.setHours(eh, em, 0, 0);
    } else {
      eventEnd.setHours(23,59,59,999);
    }

    // Validità generale
    const valid = (slotStart < eventEnd && slotEnd > eventStart);

    // Debug dettagliato
    if (valid) {
      console.log(`🪲 DEBUG slot valid:
        ID: ${e.id}
        title: ${e.title}
        recurrence: ${e.recurrence}
        eventStart: ${eventStart}
        eventEnd: ${eventEnd}
        slot: ${h}:00`);
    }

    return valid;
  });

/*
  console.log(`🕒 [week] slot ${day.toISOString().slice(0,10)} ${h}:00 – eventi trovati:`, results.map(e => e.id));
  results.forEach(e => {
  console.log(`🪲 DEBUG event slot:
    ID: ${e.id}
    title: ${e.title}
    recurrence: ${e.recurrence}
    startDate: ${e.startDate}
    endDate: ${e.endDate}
    startTime: ${e.startTime}
    endTime: ${e.endTime}`);
}); */

  return results;
}




  openNew() {
    this.selectedEvent = undefined;
    this.showForm = true;
  }

  openDetail(ev: CalendarEvent, date?: Date) {
    this.selectedEvent = ev;
    this.selectedEventDate = date ? new Date(date) : new Date();
    this.showForm = true;
  }

deleteSelected(event?: CalendarEvent) {
  if (event) this.selectedEvent = event;
  if (!this.selectedEvent) return;

  const ev = this.selectedEvent;

  if (ev.recurrence !== 'none') {
    const confirmSeries = window.confirm(
      "Vuoi eliminare l'intera serie di eventi? Premi OK per eliminare **tutti** gli eventi della serie, Annulla per eliminare **solo questa** occorrenza."
    );

    if (confirmSeries) {
      // Eliminazione intera serie
      this.eventSvc.deleteEvent(ev.id)
        .then(() => this.eventSvc.getAllEvents())
        .then(evArr => {
          this.events = evArr;
          this.selectedEvent = undefined;
          this.selectedEventDate = undefined;
        });

    } else {
      // Eliminazione singola occorrenza
      if (!this.selectedEventDate) this.selectedEventDate = new Date();

      const occDate = this.selectedEventDate;
      const start = new Date(ev.startDate);
      const end = new Date(ev.endDate);

      // Verifica che l'occorrenza sia dentro i limiti della serie
      if (occDate < start || occDate > end) {
        this.selectedEvent = undefined;
        this.selectedEventDate = undefined;
        return;
      }

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

      // Gestione rimozione singola occorrenza
      if (occDate.getTime() === start.getTime()) {
        // Rimuove la prima occorrenza: sposta startDate in avanti
        ev.startDate = nextOccurrenceDate(occDate, ev.recurrence || 'none');
        this.eventSvc.updateEvent(ev)
          .then(() => this.eventSvc.getAllEvents())
          .then(evArr => {
            this.events = evArr;
            this.selectedEvent = undefined;
            this.selectedEventDate = undefined;
          });

      } else if (occDate.getTime() === end.getTime()) {
        // Rimuove l'ultima occorrenza: sposta endDate indietro
        ev.endDate = prevOccurrenceDate(occDate, ev.recurrence || 'none');
        this.eventSvc.updateEvent(ev)
          .then(() => this.eventSvc.getAllEvents())
          .then(evArr => {
            this.events = evArr;
            this.selectedEvent = undefined;
            this.selectedEventDate = undefined;
          });

      } else {
        // Rimuove occorrenza intermedia: split in due eventi
        const newEvent: CalendarEvent = { ...ev };
        newEvent.id = Math.random().toString(36).substring(2, 15);
        newEvent.startDate = nextOccurrenceDate(occDate, ev.recurrence || 'none');
        newEvent.endDate = end;

        ev.endDate = prevOccurrenceDate(occDate, ev.recurrence || 'none');

        this.eventSvc.updateEvent(ev)
          .then(() => this.eventSvc.addEvent(newEvent))
          .then(() => this.eventSvc.getAllEvents())
          .then(evArr => {
            this.events = evArr;
            this.selectedEvent = undefined;
            this.selectedEventDate = undefined;
          });
      }
    }

  } else {
    // Eliminazione evento non ricorrente
    this.eventSvc.deleteEvent(ev.id)
      .then(() => this.eventSvc.getAllEvents())
      .then(evArr => {
        this.events = evArr;
        this.selectedEvent = undefined;
        this.selectedEventDate = undefined;
      });
  }
}

  saveEvent(ev: CalendarEvent) {
    if (this.selectedEvent) {
      this.eventSvc.updateEvent(ev)
        .then(() => this.eventSvc.getAllEvents())
        .then(evArr => {
          this.events = evArr;
        });
    } else {
      this.eventSvc.addEvent(ev)
        .then(() => this.loadEvents());
    }
    this.closeForm();
  }

  closeForm() {
    this.selectedEvent = undefined;
    this.showForm = false;
  }
}
