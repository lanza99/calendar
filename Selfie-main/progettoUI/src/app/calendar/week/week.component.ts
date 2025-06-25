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
    // Calcola il lunedì della settimana corrente (Monday as start of week)
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
    const ds = day.toISOString().slice(0,10);
    const hourStr = h.toString().padStart(2, '0');
    return this.events.filter(e => {
      if (e.startDate <= ds && e.endDate >= ds) {
        if (e.allDay) {
          if (e.recurrence === 'none' && e.startDate === ds) return true;
          if (e.recurrence === 'daily' && ds >= e.startDate) return true;
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
          return false;
        }
        if (e.startTime?.startsWith(hourStr)) {
          if (e.recurrence === 'none' && e.startDate === ds) return true;
          if (e.recurrence === 'daily' && ds >= e.startDate) return true;
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
    this.selectedEventDate = date ? new Date(date) : new Date();
    this.showForm = true;
  }

  deleteSelected(event?: CalendarEvent) {
    if (event) this.selectedEvent = event;
    if (!this.selectedEvent) return;
    if (this.selectedEvent.recurrence !== 'none') {
      const confirmSeries = window.confirm(
        "Vuoi eliminare l'intera serie di eventi? Premi OK per eliminare **tutti** gli eventi della serie, Annulla per eliminare **solo questa** occorrenza."
      );
      if (confirmSeries) {
        this.eventSvc.deleteEvent(this.selectedEvent.id)
          .then(() => this.eventSvc.getAllEvents())
          .then(evArr => {
            this.events = evArr;
            this.selectedEvent = undefined;
            this.selectedEventDate = undefined;
          });
      } else {
        if (!this.selectedEventDate) {
          this.selectedEventDate = new Date();
        }
        const occDateStr = this.selectedEventDate.toISOString().slice(0,10);
        if (occDateStr < this.selectedEvent.startDate || occDateStr > this.selectedEvent.endDate) {
          this.selectedEvent = undefined;
          this.selectedEventDate = undefined;
          return;
        }
        const origStart = this.selectedEvent.startDate;
        const origEnd = this.selectedEvent.endDate;
        const rec = this.selectedEvent.recurrence;
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
          this.selectedEvent.startDate = nextDateStr;
          this.eventSvc.updateEvent(this.selectedEvent)
            .then(() => this.eventSvc.getAllEvents())
            .then(evArr => {
              this.events = evArr;
              this.selectedEvent = undefined;
              this.selectedEventDate = undefined;
            });
        } else if (occDateStr === origEnd) {
          this.selectedEvent.endDate = prevDateStr;
          this.eventSvc.updateEvent(this.selectedEvent)
            .then(() => this.eventSvc.getAllEvents())
            .then(evArr => {
              this.events = evArr;
              this.selectedEvent = undefined;
              this.selectedEventDate = undefined;
            });
        } else {
          const originalEvent = { ...this.selectedEvent };
          this.selectedEvent.endDate = prevDateStr;
          const newEvent: CalendarEvent = { ...originalEvent };
          newEvent.id = Math.random().toString(36).substring(2, 15);
          newEvent.startDate = nextDateStr;
          newEvent.endDate = origEnd;
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
