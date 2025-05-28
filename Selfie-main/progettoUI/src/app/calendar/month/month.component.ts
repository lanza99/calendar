import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from '../event-form/event-form.component';
import { EventFormComponent, parseLocalDate } from '../event-form/event-form.component';
import { EventService } from '../services/event.service';



@Component({
  selector: 'app-month',
  standalone: true,
  imports: [CommonModule, EventFormComponent],
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css']
})
export class MonthComponent implements OnInit {
  @Input() baseDate!: Date;
  weeks: Date[][] = [];
  events: CalendarEvent[] = [];
  showForm = false;
  private swipeStartX = 0;

  ngOnInit() {
    this.buildCalendar();
    this.loadEvents();
  }
  ngOnChanges() {
    this.buildCalendar();
    this.loadEvents();
  }

  // --- Swipe handlers ---
  startSwipe(e: PointerEvent) { this.swipeStartX = e.clientX; }
  endSwipe(e: PointerEvent) {
    const dx = e.clientX - this.swipeStartX;
    if (dx > 50)  this.shiftMonth(-1);
    if (dx < -50) this.shiftMonth( 1);
  }

  private shiftMonth(n: number) {
    this.baseDate = new Date(this.baseDate.getFullYear(), this.baseDate.getMonth()+n, 1);
    this.buildCalendar();
    this.loadEvents();
  }

  private buildCalendar() {
    const y = this.baseDate.getFullYear(), m = this.baseDate.getMonth();
    const first = new Date(y, m, 1);
    let offset = (first.getDay()+6)%7; // lun=0
    let cur = new Date(y, m, 1 - offset);
    this.weeks = [];
    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cur));
        cur.setDate(cur.getDate()+1);
      }
      this.weeks.push(week);
    }
  }

  public loadEvents() {
    this.events = JSON.parse(localStorage.getItem('calendarEvents')||'[]');
  }

  eventsForDay(day: Date): CalendarEvent[] {
  const ds = day.toISOString().slice(0,10);
  return this.events.filter(e => {
    // data originaria
    if (e.date === ds) return true;
    // ricorrenza giornaliera
    if (e.recurrence === 'daily' && e.date < ds) return true;
    // ricorrenza settimanale: stesso weekday
    if (e.recurrence === 'weekly') {
      const orig = parseLocalDate(e.date).getDay();
      if (day.getDay() === orig && parseLocalDate(e.date) < day) return true;
    }
    // ricorrenza mensile: stesso giorno del mese
    if (e.recurrence === 'monthly' && day.getDate() === parseLocalDate(e.date).getDate()
        && parseLocalDate(e.date) < day) return true;
    // ricorrenza annuale: stesso giorno+mese
    if (e.recurrence === 'yearly'
        && day.getDate() === parseLocalDate(e.date).getDate()
        && day.getMonth() === parseLocalDate(e.date).getMonth()
        && parseLocalDate(e.date) < day) return true;
    return false;
  });
}

}
