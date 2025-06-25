import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CalendarEvent } from '../calendar/event-form/event-form.component';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = 'http://localhost:8080/evento';

  constructor(private http: HttpClient) {}

  getAllEvents(): Promise<CalendarEvent[]> {
  return lastValueFrom(this.http.get<any[]>(this.apiUrl))
    .then(events => events.map(e => ({ ...e, id: e._id })));
}

addEvent(event: CalendarEvent): Promise<CalendarEvent> {
  return lastValueFrom(this.http.post<any>(this.apiUrl, event))
    .then(e => ({ ...e, id: e._id }));
}




  updateEvent(event: CalendarEvent): Promise<void> {
    return lastValueFrom(this.http.put<void>(`${this.apiUrl}/${event.id}`, event));
  }

  deleteEvent(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  deleteSeries(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.apiUrl}/series/${id}`));
  }
}
