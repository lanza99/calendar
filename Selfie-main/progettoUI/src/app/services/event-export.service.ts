import { createEvent } from 'ics';

export function generaICS(event: {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
}) {
  const start: [number, number, number, number, number] = [
    event.startDate.getFullYear(),
    event.startDate.getMonth() + 1,
    event.startDate.getDate(),
    event.startDate.getHours(),
    event.startDate.getMinutes()
  ];
  const end: [number, number, number, number, number] = [
    event.endDate.getFullYear(),
    event.endDate.getMonth() + 1,
    event.endDate.getDate(),
    event.endDate.getHours(),
    event.endDate.getMinutes()
  ];

  const eventData = {
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    start,
    end
  };

  createEvent(eventData, (error, value) => {
    if (error) {
      console.error('Errore durante la creazione del file ICS', error);
      return;
    }

    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title || 'evento'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
