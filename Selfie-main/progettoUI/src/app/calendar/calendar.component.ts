import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { DayComponent }   from './day/day.component';
import { WeekComponent }  from './week/week.component';
import { MonthComponent } from './month/month.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, NavbarComponent, DayComponent, WeekComponent, MonthComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  // Vista corrente (default "month")
  view: 'day' | 'week' | 'month' = 'month';

  // Data di riferimento per la vista (default oggi)
  currentDate: Date = new Date();

  // Cambia vista
  setView(v: 'day' | 'week' | 'month') {
    this.view = v;
  }

  // Vai al giorno/settimana/mese precedente
  prev() {
    const d = new Date(this.currentDate);
    if (this.view === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (this.view === 'week') {
      d.setDate(d.getDate() - 7);
    } else { // 'month'
      d.setMonth(d.getMonth() - 1);
    }
    this.currentDate = d;
  }

  // Vai al giorno/settimana/mese successivo
  next() {
    const d = new Date(this.currentDate);
    if (this.view === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (this.view === 'week') {
      d.setDate(d.getDate() + 7);
    } else { // 'month'
      d.setMonth(d.getMonth() + 1);
    }
    this.currentDate = d;
  }

  // Restituisce la stringa della data corrente in italiano per l’header
  getCurrentLabel(): string {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    return this.currentDate.toLocaleDateString('it-IT', opts);
  }

  // Per la vista settimana, mostra range “Mese G–G Mese”, es. “giu 2–8 giu”
  getWeekLabel(): string {
    // Trova lunedì e domenica della settimana corrente
    const dow = (this.currentDate.getDay() + 6) % 7; // lunedì=0… domenica=6
    const monday = new Date(this.currentDate);
    monday.setDate(this.currentDate.getDate() - dow);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Estrai giorno e mese (in italiano)
    const dayM = monday.getDate();
    const dayS = sunday.getDate();
    const monthName = monday.toLocaleDateString('it-IT', { month: 'short' });

    return `${monthName} ${dayM}–${dayS} ${monthName}`;
  }

  // Per la vista mese, mostra “Mese YYYY”, es. “giugno 2025”
  getMonthLabel(): string {
    return this.currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  }
}
