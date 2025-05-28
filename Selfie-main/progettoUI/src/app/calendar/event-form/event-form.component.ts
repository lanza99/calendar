import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CalendarEvent {
  title: string;
  date:   string;    // "YYYY-MM-DD"
  allDay: boolean;
  startTime?: string;
  endTime?:   string;
  recurrence?: 'daily'|'weekly'|'monthly'|'yearly';
  reminder?:   number;
  color:       string;   // nuovo: es. "#6f42c1"
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent {
  @Output() newEvent = new EventEmitter<CalendarEvent>();

  title = '';
  date = '';
  startTime = '';
  endTime = '';
  allDay = false;
 recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly' | '' = '';
  reminder: number | null = null;
    color = '#6f42c1';

  createEvent() {
    if (!this.title||!this.date) return;
    const ev: CalendarEvent = {
      title: this.title,
      date:  this.date,
      allDay: this.allDay,
      startTime: this.allDay?undefined:this.startTime,
      endTime:   this.allDay?undefined:this.endTime,
      recurrence: this.recurrence||undefined,
      reminder:   this.reminder||undefined,
      color:      this.color
    };
    const arr = JSON.parse(localStorage.getItem('calendarEvents')||'[]');
    arr.push(ev);
    localStorage.setItem('calendarEvents', JSON.stringify(arr));
    this.newEvent.emit(ev);
    this.resetForm();
  }


  
  onAllDayToggle(): void {
    if (this.allDay) {
      this.startTime = '';
      this.endTime = '';
    }
  }

  private resetForm(): void {
    this.title = '';
    this.date = '';
    this.startTime = '';
    this.endTime = '';
    this.allDay = false;
    this.recurrence = '';
    this.reminder = null;
  }
  
}


/** Crea Date in locale da stringa "YYYY-MM-DD" */
export function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(s=>parseInt(s,10));
  return new Date(y, m-1, d);
}



