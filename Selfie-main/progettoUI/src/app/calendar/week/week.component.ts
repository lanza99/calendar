import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from '../event-form/event-form.component';
import { EventFormComponent, parseLocalDate } from '../event-form/event-form.component';

@Component({
  selector: 'app-week',
  standalone: true,
  imports: [CommonModule, EventFormComponent],
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.css']
})
export class WeekComponent implements OnInit {
  @Input() baseDate!: Date;
  days: Date[] = [];
  hours = Array.from({length:24},(_,i)=>i);
  events: CalendarEvent[] = [];
  showForm = false;
  private swipeStartX = 0;

  ngOnInit() {
    this.buildWeek();
    this.loadEvents();
  }
  ngOnChanges() {
    this.buildWeek();
    this.loadEvents();
  }

  // --- Swipe handlers ---
  startSwipe(e: PointerEvent) { this.swipeStartX = e.clientX; }
  endSwipe(e: PointerEvent) {
    const dx = e.clientX - this.swipeStartX;
    if (dx > 50)  this.shiftWeek(-1);
    if (dx < -50) this.shiftWeek( 1);
  }

  private shiftWeek(n: number) {
    this.baseDate.setDate(this.baseDate.getDate() + 7*n);
    this.baseDate = new Date(this.baseDate);
    this.buildWeek();
    this.loadEvents();
  }

  private buildWeek() {
    const dow = (this.baseDate.getDay()+6)%7;
    const monday = new Date(this.baseDate);
    monday.setDate(this.baseDate.getDate() - dow);
    this.days = Array.from({length:7},(_,i)=>{
      const d=new Date(monday);
      d.setDate(monday.getDate()+i);
      return d;
    });
  }

  public loadEvents() {
    this.events = JSON.parse(localStorage.getItem('calendarEvents')||'[]');
  }

  eventsForSlot(day: Date, h: number): CalendarEvent[] {
  const ds = day.toISOString().slice(0,10);
  return this.events.filter(e => {
    // orario coincide
    const sameSlot = !e.allDay
      && e.startTime?.startsWith(h.toString().padStart(2,'0'));
    // data/ricorrenza
    if (e.date === ds && sameSlot) return true;
    if (e.recurrence === 'daily' && sameSlot && e.date < ds) return true;
    if (e.recurrence === 'weekly') {
      const orig = parseLocalDate(e.date).getDay();
      if (day.getDay()===orig && sameSlot && parseLocalDate(e.date)<day) return true;
    }
    // le altre ricorrenze orarie (mensile, yearly) raramente usate qui
    return false;
  });
}

}
