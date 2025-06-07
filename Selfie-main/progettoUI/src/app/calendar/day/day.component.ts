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
  // baseDate potrebbe essere undefined se chiamato senza input
  @Input() baseDate?: Date;

  hours = Array.from({ length: 24 }, (_, i) => i);
  events: CalendarEvent[] = [];
  selectedEvent?: CalendarEvent;
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
    return this.events.filter(e => {
      if (e.startDate <= ds && e.endDate >= ds) {
        if (e.allDay) {
          if (e.recurrence === 'none' && e.startDate === ds) return true;
          if (e.recurrence === 'daily' && ds >= e.startDate) return true;
          if (e.recurrence === 'weekly') {
            const origDow = new Date(e.startDate).getDay();
            if (this.baseDate!.getDay() === origDow && ds >= e.startDate) return true;
          }
          return false;
        }
        if (e.startTime?.startsWith(h.toString().padStart(2,'0'))) {
          if (e.recurrence === 'none' && e.startDate === ds) return true;
          if (e.recurrence === 'daily' && ds >= e.startDate) return true;
          if (e.recurrence === 'weekly') {
            const origDow = new Date(e.startDate).getDay();
            if (this.baseDate!.getDay() === origDow && ds >= e.startDate) return true;
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
