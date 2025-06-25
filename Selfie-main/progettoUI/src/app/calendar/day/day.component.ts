import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService }  from '../../services/event.service';
import { EventFormComponent, CalendarEvent } from '../event-form/event-form.component';

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [CommonModule, EventFormComponent],
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.css']
})
export class DayComponent implements OnInit, OnChanges {
  @Input() baseDate?: Date;

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
    this.loadEvents();
  }
  ngOnChanges() {
    if (!this.baseDate) {
      this.baseDate = new Date();
    }
    this.loadEvents();
  }

  loadEvents() {
    this.eventSvc.getAllEvents().then(ev => this.events = ev);
  }

  eventsForHour(h: number): CalendarEvent[] {
    const ds = this.baseDate!.toISOString().slice(0,10);
    const hourStr = h.toString().padStart(2, '0');
    return this.events.filter(e => {
      if (e.startDate <= ds && e.endDate >= ds) {
        if (e.allDay) {
          if (e.recurrence === 'none' && e.startDate === ds) return true;
          if (e.recurrence === 'daily' && ds >= e.startDate) return true;
          if (e.recurrence === 'weekly') {
            const origDow = new Date(e.startDate).getDay();
            if (this.baseDate!.getDay() === origDow && ds >= e.startDate) return true;
          }
          if (e.recurrence === 'monthly') {
            const origDay = parseInt(e.startDate.slice(8,10), 10);
            if (this.baseDate!.getDate() === origDay && ds >= e.startDate) return true;
          }
          if (e.recurrence === 'yearly') {
            const orig = new Date(e.startDate);
            if (
              this.baseDate!.getDate() === orig.getDate() &&
              this.baseDate!.getMonth() === orig.getMonth() &&
              ds >= e.startDate
            ) return true;
          }
          return false;
        }
        if (e.startTime?.startsWith(hourStr)) {
          if (e.recurrence === 'none' && e.startDate === ds) return true;
          if (e.recurrence === 'daily' && ds >= e.startDate) return true;
          if (e.recurrence === 'weekly') {
            const origDow = new Date(e.startDate).getDay();
            if (this.baseDate!.getDay() === origDow && ds >= e.startDate) return true;
          }
          if (e.recurrence === 'monthly') {
            const origDay = parseInt(e.startDate.slice(8,10), 10);
            if (this.baseDate!.getDate() === origDay && ds >= e.startDate) return true;
          }
          if (e.recurrence === 'yearly') {
            const orig = new Date(e.startDate);
            if (
              this.baseDate!.getDate() === orig.getDate() &&
              this.baseDate!.getMonth() === orig.getMonth() &&
              ds >= e.startDate
            ) return true;
          }
        }
      }
      return false;
    });
  }

  openNew() {
    this.selectedEvent = undefined;
    this.showForm = true;
  }

  openDetail(ev: CalendarEvent, date?: Date) {
    this.selectedEvent = ev;
    // Memorizza la data dell'occorrenza selezionata (default = data corrente se non fornita)
    this.selectedEventDate = date ? new Date(date) : (this.baseDate ? new Date(this.baseDate) : new Date());
    this.showForm = true;
  }

  deleteSelected(event?: CalendarEvent) {
    if (event) this.selectedEvent = event;
    if (!this.selectedEvent) return;
    // Se l'evento è ricorrente, chiedi se eliminare singola occorrenza o tutta la serie
    if (this.selectedEvent.recurrence !== 'none') {
      const confirmSeries = window.confirm(
        "Vuoi eliminare l'intera serie di eventi? Premi OK per eliminare **tutti** gli eventi della serie, Annulla per eliminare **solo questa** occorrenza."
      );
      if (confirmSeries) {
        // Eliminazione serie completa
        this.eventSvc.deleteEvent(this.selectedEvent.id)
          .then(() => this.eventSvc.getAllEvents())
          .then(evArr => {
            this.events = evArr;
            this.selectedEvent = undefined;
            this.selectedEventDate = undefined;
          });
      } else {
        // Eliminazione singola occorrenza
        if (!this.selectedEventDate) {
          this.selectedEventDate = this.baseDate ? new Date(this.baseDate) : new Date();
        }
        const occDateStr = this.selectedEventDate.toISOString().slice(0,10);
        // Verifica che la data da eliminare rientri nel range dell'evento
        if (occDateStr < this.selectedEvent.startDate || occDateStr > this.selectedEvent.endDate) {
          this.selectedEvent = undefined;
          this.selectedEventDate = undefined;
          return;
        }
        const origStart = this.selectedEvent.startDate;
        const origEnd = this.selectedEvent.endDate;
        const rec = this.selectedEvent.recurrence;
        // Calcola la data precedente e successiva all'occorrenza da eliminare
        let prevDate = new Date(occDateStr);
        let nextDate = new Date(occDateStr);
        if (rec === 'daily') {
          prevDate.setDate(prevDate.getDate() - 1);
          nextDate.setDate(nextDate.getDate() + 1);
        } else if (rec === 'weekly') {
          prevDate.setDate(prevDate.getDate() - 7);
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (rec === 'monthly') {
          prevDate.setMonth(prevDate.getMonth() - 1);
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (rec === 'yearly') {
          prevDate.setFullYear(prevDate.getFullYear() - 1);
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
        const prevDateStr = prevDate.toISOString().slice(0,10);
        const nextDateStr = nextDate.toISOString().slice(0,10);
        if (occDateStr === origStart) {
          // Caso 1: rimuoviamo la prima occorrenza – sposta in avanti la data d'inizio
          this.selectedEvent.startDate = nextDateStr;
          this.eventSvc.updateEvent(this.selectedEvent)
            .then(() => this.eventSvc.getAllEvents())
            .then(evArr => {
              this.events = evArr;
              this.selectedEvent = undefined;
              this.selectedEventDate = undefined;
            });
        } else if (occDateStr === origEnd) {
          // Caso 2: rimuoviamo l'ultima occorrenza – anticipa la data di fine
          this.selectedEvent.endDate = prevDateStr;
          this.eventSvc.updateEvent(this.selectedEvent)
            .then(() => this.eventSvc.getAllEvents())
            .then(evArr => {
              this.events = evArr;
              this.selectedEvent = undefined;
              this.selectedEventDate = undefined;
            });
        } else {
          // Caso 3: rimuoviamo un'occorrenza in mezzo – spezza l'evento in due serie
          const originalEvent = { ...this.selectedEvent };
          // Serie 1: termina il giorno prima dell'occorrenza eliminata
          this.selectedEvent.endDate = prevDateStr;
          // Serie 2: nuova serie che inizia il giorno dopo l'occorrenza eliminata
          const newEvent: CalendarEvent = { ...originalEvent };
          newEvent.id = Math.random().toString(36).substring(2, 15);
          newEvent.startDate = nextDateStr;
          newEvent.endDate = origEnd;
          // Salva modifiche: aggiorna evento originale e aggiungi nuovo evento
          this.eventSvc.updateEvent(this.selectedEvent)
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
      // Evento non ricorrente: eliminazione semplice
      this.eventSvc.deleteEvent(this.selectedEvent.id)
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
