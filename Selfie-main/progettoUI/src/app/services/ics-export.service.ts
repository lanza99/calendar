import { Injectable } from '@angular/core';
import { ICS } from '@pgswe/ics.js';

@Injectable({
  providedIn: 'root'
})
export class IcsExportService {
  esportaEvento(event: {
    title: string;
    description?: string;
    startDate: Date | string;
    endDate: Date | string;
    luogo?: string;
  }) {
    const ics = new ICS();

    ics.addEvent({
      title: event.title,
      description: event.description || '',
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      location: event.luogo || '',
    });

    const blob = new Blob([ics.toString()], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    link.click();
  }
}
