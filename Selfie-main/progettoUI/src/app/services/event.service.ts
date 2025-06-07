import { Injectable } from '@angular/core';
import { CalendarEvent } from '../calendar/event-form/event-form.component';

@Injectable({ providedIn: 'root' })
export class EventService {
  private storageKey = 'calendarEvents';

  private loadAll(): CalendarEvent[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  getAllEvents(): Promise<CalendarEvent[]> {
    return Promise.resolve(this.loadAll());
  }

  getEventById(id: string): Promise<CalendarEvent | undefined> {
    return Promise.resolve(this.loadAll().find(e => e.id === id));
  }

  addEvent(event: CalendarEvent): Promise<void> {
    const arr = this.loadAll();
    arr.push(event);
    localStorage.setItem(this.storageKey, JSON.stringify(arr));
    return Promise.resolve();
  }

  updateEvent(updated: CalendarEvent): Promise<void> {
    const arr = this.loadAll().map(e => e.id === updated.id ? updated : e);
    localStorage.setItem(this.storageKey, JSON.stringify(arr));
    return Promise.resolve();
  }

  deleteEvent(id: string): Promise<void> {
    const arr = this.loadAll().filter(e => e.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(arr));
    return Promise.resolve();
  }
}
