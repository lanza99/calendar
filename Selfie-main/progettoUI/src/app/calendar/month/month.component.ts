import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService }  from '../../services/event.service';
import { EventFormComponent, CalendarEvent } from '../event-form/event-form.component';

@Component({
  selector: 'app-month',
  standalone: true,
  imports: [CommonModule, EventFormComponent],
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css']
})
export class MonthComponent implements OnInit, OnChanges {
  // baseDate diventa opzionale e può essere undefined
  @Input() baseDate?: Date;

  weeks: Date[][] = [];
  events: CalendarEvent[] = [];
  selectedEvent?: CalendarEvent;
  showForm = false;

  constructor(private eventSvc: EventService) {}

  ngOnInit() {
    // Se baseDate non è fornita, imposta default = oggi
    if (!this.baseDate) {
      this.baseDate = new Date();
    }
    this.buildCalendar();
    this.loadEvents();
  }

  ngOnChanges() {
    // Se baseDate cambiato e undefined, impostalo a oggi
    if (!this.baseDate) {
      this.baseDate = new Date();
    }
    this.buildCalendar();
    this.loadEvents();
  }

  private buildCalendar() {
    // A questo punto baseDate è sicuramente un Date
    const y = this.baseDate!.getFullYear();
    const m = this.baseDate!.getMonth();
    const first = new Date(y, m, 1);

    // Calcola quanti giorni del mese precedente "riempiono" la prima riga
    let offset = (first.getDay() + 6) % 7; // converte in lunedì=0, …, domenica=6

    // Partiamo dal lunedì della prima settimana (anche se cade in mese precedente)
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
    this.eventSvc.getAllEvents().then(ev => this.events = ev);
  }

  eventsForDay(day: Date): CalendarEvent[] {
    const ds = day.toISOString().slice(0,10);
    return this.events.filter(e => {
      // L’evento copre la data “ds” se startDate <= ds <= endDate,
      // quindi controlla la ricorrenza senza sbagliare di un giorno.
      if (e.startDate <= ds && e.endDate >= ds) {
        if (e.recurrence === 'none') {
          return e.startDate === ds;
        }
        if (e.recurrence === 'daily') {
          return ds >= e.startDate;
        }
        if (e.recurrence === 'weekly') {
          const origDow = new Date(e.startDate).getDay();
          if (day.getDay() === origDow && ds >= e.startDate) return true;
        }
        if (e.recurrence === 'monthly') {
          const origDay = parseInt(e.startDate.slice(8,10), 10);
          if (day.getDate() === origDay && ds >= e.startDate) return true;
        }
        if (e.recurrence === 'yearly') {
          const orig = new Date(e.startDate);
          if (
            day.getDate() === orig.getDate() &&
            day.getMonth() === orig.getMonth() &&
            ds >= e.startDate
          ) return true;
        }
      }
      return false;
    });
  }

  openNew() {
    this.selectedEvent = undefined;
    this.showForm = true;
  }

  openDetail(ev: CalendarEvent) {
    this.selectedEvent = ev;
    this.showForm = true;
  }

  deleteSelected() {
    if (!this.selectedEvent) return;
    this.eventSvc.deleteEvent(this.selectedEvent.id)
      .then(() => this.eventSvc.getAllEvents())
      .then(ev => {
        this.events = ev;
        this.selectedEvent = undefined;
      });
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
