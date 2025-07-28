import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { DayComponent } from './day/day.component';
import { WeekComponent } from './week/week.component';
import { MonthComponent } from './month/month.component';
import { HttpClient } from '@angular/common/http';
import { EventFormComponent } from './event-form/event-form.component';
import { EventService } from '../services/event.service';
import { UnavailabilityService, Unavailability } from '../services/unavailability.service';
import { UnavailabilityFormComponent } from './unavailability-form/unavailability-form.component';
import { generaICS } from '../services/event-export.service';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    DayComponent,
    WeekComponent,
    MonthComponent,
    EventFormComponent,
    UnavailabilityFormComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  view: 'day' | 'week' | 'month' = 'month';
  currentDate: Date = new Date();

  showSidebar: boolean = false;
  showUnavailabilityForm: boolean = false;

  tutteAttivita: any[] = [];
  attivitainRitardo: any[] = [];
  attivitaInCorso: any[] = [];
  attivitaCompletate: any[] = [];
  eventi: any[] = [];
  inviti: any[] = [];

  unavailability: Unavailability[] = [];
  editingUnavailability?: any;

  currentUser: string = 'utente1';

  selectedAttivita?: any;
  showEventForm: boolean = false;

  notifiedEvents = new Set<string>();
  notificheAttive = new Set<string>();

  @ViewChild('unavailabilityForm') unavailabilityFormComponent?: UnavailabilityFormComponent;

  constructor(
    private http: HttpClient,
    private eventService: EventService,
    private unavailabilityService: UnavailabilityService
  ) {}

  ngOnInit(): void {
    this.requestNotificationPermission();
    this.fetchAttivita();
    this.fetchEventi();
    this.fetchUnavailability();
    setInterval(() => this.checkEventNotifications(), 60 * 1000);
  }

  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
    if (this.showSidebar) {
      this.fetchAttivita();
    }
  }

  openUnavailabilityForm(): void {
    this.showUnavailabilityForm = true;
    setTimeout(() => this.unavailabilityFormComponent?.openForm(), 0);
  }

  closeUnavailabilityForm(): void {
    this.showUnavailabilityForm = false;
    this.editingUnavailability = undefined;
  }

  fetchAttivita(): void {
    this.http.get<any[]>('http://localhost:8080/attivita').subscribe({
      next: (res) => {
        const now = new Date();
        const todayStr = new Date().toISOString().split('T')[0];
        const alreadyNotified = sessionStorage.getItem('notified-' + todayStr);

        this.tutteAttivita = res;

        this.attivitainRitardo = res.filter(a => !a.completata && new Date(a.dataScadenza) < now);
        this.attivitaInCorso = res.filter(a => !a.completata && new Date(a.dataScadenza) >= now);
        this.attivitaCompletate = res.filter(a => a.completata);

        if (!alreadyNotified && new Date().getHours() >= 8) {
          this.triggerAttivitaNotifiche(res);
          sessionStorage.setItem('notified-' + todayStr, 'true');
        }
      },
      error: (err) => console.error('Errore nel caricamento attività', err)
    });
  }

  fetchEventi(): void {
    this.eventService.getAllEvents().then(res => {
      this.eventi = res;
      this.inviti = res.filter(ev =>
        ev.partecipazioni?.some(p => p.utente === this.currentUser && p.stato === 'in_attesa')
      );
    });
  }

  fetchUnavailability(): void {
    this.unavailabilityService.getAll(this.currentUser)
      .then(res => this.unavailability = res || [])
      .catch(err => console.error('Errore nel caricamento indisponibilità', err));
  }

  aggiungiUnavailability(data: Omit<Unavailability, 'user'>): void {
    if (this.editingUnavailability) {
      this.unavailabilityService
        .updateOne(this.editingUnavailability._id, { ...data })
        .then(() => {
          this.editingUnavailability = undefined;
          this.fetchUnavailability();
          this.closeUnavailabilityForm();
        });
    } else {
      this.unavailabilityService
        .addOne({ ...data, user: this.currentUser })
        .then(() => {
          this.fetchUnavailability();
          this.closeUnavailabilityForm();
        });
    }
  }

  modificaUnavailability(item: any) {
    this.editingUnavailability = item;
    this.showUnavailabilityForm = true;
    setTimeout(() => this.unavailabilityFormComponent?.openFormWith(item), 0);
  }

  eliminaUnavailability(id: string) {
    if (confirm('Vuoi eliminare questa indisponibilità?')) {
      this.unavailabilityService.deleteOne(id).then(() => this.fetchUnavailability());
    }
  }

  accettaInvito(eventId: string) {
    this.eventService.rispondiAInvito(eventId, this.currentUser, 'accettato').then(() => this.fetchEventi());
  }

  rifiutaInvito(eventId: string) {
    this.eventService.rispondiAInvito(eventId, this.currentUser, 'rifiutato').then(() => this.fetchEventi());
  }

  triggerAttivitaNotifiche(attivita: any[]): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const in7days = new Date();
    in7days.setDate(today.getDate() + 7);

    attivita.forEach(att => {
      const scadenza = new Date(att.dataScadenza);
      const nome = att.titolo;

      const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      if (!att.completata && isSameDay(scadenza, in7days)) {
        new Notification('Promemoria attività', { body: `Hai 1 settimana per completare l'attività "${nome}"` });
      }
      if (!att.completata && isSameDay(scadenza, tomorrow)) {
        new Notification('Attività in scadenza', { body: `La tua attività "${nome}" scadrà domani` });
      }
      if (!att.completata && scadenza < today) {
        new Notification('Attività scaduta', { body: `Sei in ritardo con la tua attività "${nome}"` });
      }
    });
  }

  checkEventNotifications(): void {
    const now = new Date();

    this.eventi.forEach(ev => {
      if (!ev.startDate || ev.reminderMinutes == null || ev.startTime == null) return;
      const [h, m] = ev.startTime.split(":").map((x: string) => +x);

      const start = new Date(ev.startDate);
      start.setHours(h, m, 0, 0);

      const reminderTime = new Date(start.getTime() - ev.reminderMinutes * 60000);
      const diff = now.getTime() - reminderTime.getTime();

      const isInReminderWindow = diff >= 0 && diff < 5 * 60 * 1000;

      if (isInReminderWindow && !this.notifiedEvents.has(ev.id)) {
        const notification = new Notification('Promemoria evento', {
          body: `Tra ${ev.reminderMinutes} minuti: ${ev.title}`,
        });
        notification.onclick = () => this.notificheAttive.add(ev.id);
        this.notifiedEvents.add(ev.id);
      }

      const ongoingRepeat = now > reminderTime && now < start;
      const shouldRepeat = this.notificheAttive.has(ev.id);

      if (ongoingRepeat && shouldRepeat && now.getMinutes() % 5 === 0) {
        new Notification('Promemoria evento (ripetuto)', {
          body: `Evento imminente: ${ev.title}`,
        });
      }
    });
  }

  setView(v: 'day' | 'week' | 'month') {
    this.view = v;
  }

  prev() {
    const d = new Date(this.currentDate);
    this.view === 'day' ? d.setDate(d.getDate() - 1)
      : this.view === 'week' ? d.setDate(d.getDate() - 7)
      : d.setMonth(d.getMonth() - 1);
    this.currentDate = d;
  }

  next() {
    const d = new Date(this.currentDate);
    this.view === 'day' ? d.setDate(d.getDate() + 1)
      : this.view === 'week' ? d.setDate(d.getDate() + 7)
      : d.setMonth(d.getMonth() + 1);
    this.currentDate = d;
  }

  getCurrentLabel(): string {
    return this.currentDate.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getWeekLabel(): string {
    const dow = (this.currentDate.getDay() + 6) % 7;
    const monday = new Date(this.currentDate);
    monday.setDate(this.currentDate.getDate() - dow);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.toLocaleString('it-IT', { month: 'short' })} ${monday.getDate()} - ${sunday.getDate()} ${sunday.toLocaleString('it-IT', { month: 'short' })}`;
  }

  getMonthLabel(): string {
    return this.currentDate.toLocaleDateString('it-IT', {
      month: 'long',
      year: 'numeric'
    });
  }

  completaAttivita(id: string) {
    this.http.patch(`http://localhost:8080/attivita/${id}/completa`, {}).subscribe(() => this.fetchAttivita());
  }

  eliminaAttivita(id: string) {
    if (confirm('Sei sicuro di voler eliminare questa attività?')) {
      this.http.delete(`http://localhost:8080/attivita/${id}`).subscribe(() => this.fetchAttivita());
    }
  }

  modificaAttivita(att: any) {
    this.selectedAttivita = {
      id: att._id,
      title: att.titolo,
      description: att.descrizione,
      luogo: att.luogo || '',
      startDate: new Date(),
      endDate: new Date(att.dataScadenza),
      allDay: true,
      startTime: undefined,
      endTime: undefined,
      reminderMinutes: 0,
      recurrence: 'none',
      color: att.colore || '#6f42c1',
      assegnati: att.assegnati?.join(', ') || ''
    };
    this.showSidebar = false;
    this.showEventForm = true;
  }

  onFormClosed() {
    this.showEventForm = false;
    this.selectedAttivita = undefined;
    this.fetchAttivita();
    this.fetchEventi();
  }

  esportaEventoComeICS(evento: any) {
  generaICS({
    title: evento.titolo || evento.title || 'Evento',
    description: evento.descrizione || evento.description || '',
    location: evento.luogo || evento.location || '',
    startDate: new Date(evento.startDate || evento.dataScadenza),
    endDate: new Date(evento.endDate || evento.dataScadenza),
  });
}

}
