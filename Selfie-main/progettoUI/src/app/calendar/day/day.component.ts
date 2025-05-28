import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from '../event-form/event-form.component';
import { EventFormComponent, parseLocalDate } from '../event-form/event-form.component';

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [CommonModule, EventFormComponent],
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.css']
})
export class DayComponent implements OnInit {
  @Input() baseDate!: Date;
  hours = Array.from({length:24},(_,i)=>i);
  events: CalendarEvent[] = [];
  showForm = false;
  private swipeStartX = 0;

  ngOnInit() {
    this.loadEvents();
  }
  ngOnChanges() {
    this.loadEvents();
  }

  // --- Swipe handlers ---
  startSwipe(e: PointerEvent) { this.swipeStartX = e.clientX; }
  endSwipe(e: PointerEvent) {
    const dx = e.clientX - this.swipeStartX;
    if (dx > 50)  this.shiftDay(-1);
    if (dx < -50) this.shiftDay( 1);
  }

  private shiftDay(n: number) {
    this.baseDate.setDate(this.baseDate.getDate() + n);
    this.baseDate = new Date(this.baseDate);
    this.loadEvents();
  }

  public loadEvents() {
    this.events = JSON.parse(localStorage.getItem('calendarEvents')||'[]');
  }

  eventsForHour(h: number): CalendarEvent[] {
  const ds = this.baseDate.toISOString().slice(0,10);
  return this.events.filter(e => {
    const sameHour = !e.allDay && e.startTime?.startsWith(h.toString().padStart(2,'0'));
    if (e.date === ds && sameHour) return true;
    if (e.recurrence === 'daily' && sameHour && e.date < ds) return true;
    if (e.recurrence === 'weekly') {
      const origDow = parseLocalDate(e.date).getDay();
      if (this.baseDate.getDay()===origDow && sameHour && parseLocalDate(e.date)<this.baseDate) return true;
    }
    return false;
  });
}

}
