export interface CalendarEvent {
  id: string;
  title: string;
  date: string;       // ISO: YYYY-MM-DD
  allDay: boolean;
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  reminderMinutes: number;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  color: string;
  description?: string;
}

export class EventService {
  private storageKey = 'calendarEvents';

  private loadEvents(): CalendarEvent[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveEvents(events: CalendarEvent[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(events));
  }

  getAllEvents(): Promise<CalendarEvent[]> {
    return Promise.resolve(this.loadEvents());
  }

  getEventById(id: string): Promise<CalendarEvent | undefined> {
    return Promise.resolve(this.loadEvents().find(e => e.id === id));
  }

  addEvent(event: CalendarEvent): Promise<void> {
    const events = this.loadEvents();
    events.push(event);
    this.saveEvents(events);
    return Promise.resolve();
  }

  updateEvent(updated: CalendarEvent): Promise<void> {
    const events = this.loadEvents().map(e => e.id === updated.id ? updated : e);
    this.saveEvents(events);
    return Promise.resolve();
  }

  deleteEvent(id: string): Promise<void> {
    const events = this.loadEvents().filter(e => e.id !== id);
    this.saveEvents(events);
    return Promise.resolve();
  }
}
