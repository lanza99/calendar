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
  // baseDate è opzionale e potrebbe arrivare undefined
  @Input() baseDate?: Date;

  days: Date[] = [];
  hours = Array.from({ length: 24 }, (_, i) => i);
  events: CalendarEvent[] = [];
  selectedEvent?: CalendarEvent;
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
    // dayOfWeek con lunedì=0
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
    return this.events.filter(e => {
      if (e.startDate <= ds && e.endDate >= ds) {
        if (e.allDay) {
          if (e.recurrence === 'none' && e.startDate === ds) return true;
          if (e.recurrence === 'daily' && ds >= e.startDate) return true;
          if (e.recurrence === 'weekly') {
            const origDow = new Date(e.startDate).getDay();
            if (day.getDay() === origDow && ds >= e.startDate) return true;
          }
          return false;
        }
        if (e.startTime?.startsWith(h.toString().padStart(2,'0'))) {
          if (e.recurrence === 'none' && e.startDate === ds) return true;
          if (e.recurrence === 'daily' && ds >= e.startDate) return true;
          if (e.recurrence === 'weekly') {
            const origDow = new Date(e.startDate).getDay();
            if (day.getDay() === origDow && ds >= e.startDate) return true;
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
