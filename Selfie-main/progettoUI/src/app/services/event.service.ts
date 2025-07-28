// services/event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CalendarEvent } from '../calendar/event-form/event-form.component';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = 'http://localhost:8080/evento';

  constructor(private http: HttpClient) {}

  getAllEvents(): Promise<CalendarEvent[]> {
    return this.http.get<any[]>(this.apiUrl)
      .toPromise()
      .then(events => {
        if (!events) return [];
        return events.map(e => ({
          id: e._id,
          title: e.title,
          description: e.description,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
          allDay: e.allDay,
          startTime: e.startTime,
          endTime: e.endTime,
          reminderMinutes: e.reminderMinutes,
          recurrence: e.recurrence,
          color: e.color,
          assegnati: e.assegnati || [],
          partecipazioni: e.partecipazioni || []
        }));
      });
  }

  addEvent(event: CalendarEvent): Promise<CalendarEvent> {
    const toSend = {
      ...event,
      startDate: (event.startDate instanceof Date) ? event.startDate.toISOString() : event.startDate,
      endDate: (event.endDate instanceof Date) ? event.endDate.toISOString() : event.endDate
    };
    return lastValueFrom(this.http.post<any>(this.apiUrl, toSend))
      .then(e => ({ ...e, id: e._id, startDate: new Date(e.startDate), endDate: new Date(e.endDate) }));
  }

  updateEvent(event: CalendarEvent): Promise<void> {
    const toSend = {
      ...event,
      startDate: (event.startDate instanceof Date) ? event.startDate.toISOString() : event.startDate,
      endDate: (event.endDate instanceof Date) ? event.endDate.toISOString() : event.endDate
    };
    return lastValueFrom(this.http.put<void>(`${this.apiUrl}/${event.id}`, toSend));
  }

  deleteEvent(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  deleteSeries(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.apiUrl}/series/${id}`));
  }

  // ✅ Nuovo metodo per accettare / rifiutare / rimandare un invito
  rispondiAInvito(eventId: string, utente: string, stato: 'accettato' | 'rifiutato' | 'in_attesa'): Promise<void> {
    return lastValueFrom(
      this.http.patch<void>(`${this.apiUrl}/${eventId}/rispondi`, { utente, stato })
    );
  }
}
