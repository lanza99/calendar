import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { MonthComponent }  from './month/month.component';
import { WeekComponent }   from './week/week.component';
import { DayComponent }    from './day/day.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MonthComponent,
    WeekComponent,
    DayComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  view: 'month'|'week'|'day' = 'month';
  base = new Date();
  menuOpen = false;
  private startX = 0;

  // titolo in header
  get title(): string {
    const optsM: Intl.DateTimeFormatOptions = { month:'long', year:'numeric' };
    const optsW: Intl.DateTimeFormatOptions = { day:'2-digit', month:'short' };
    if (this.view==='month') {
      return new Intl.DateTimeFormat('it-IT', optsM).format(this.base);
    }
    if (this.view==='week') {
      const monday = this.startOfWeek(this.base);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate()+6);
      return `${monday.getDate()}–${sunday.getDate()} ${new Intl.DateTimeFormat('it-IT',{month:'short'}).format(this.base)}`;
    }
    return new Intl.DateTimeFormat('it-IT',{ weekday:'long', day:'numeric', month:'long', year:'numeric'}).format(this.base);
  }

  setView(v:'month'|'week'|'day'){ this.view=v; }
  prev(){ this.shift(-1); }
  next(){ this.shift( 1); }

  // swipe handlers
  startSwipe(e:PointerEvent){ this.startX = e.clientX; }
  endSwipe(e:PointerEvent){
    const dx = e.clientX - this.startX;
    if (dx>50) this.prev();
    if (dx<-50) this.next();
  }

  private shift(n:number){
    if (this.view==='month') {
      this.base = new Date(this.base.getFullYear(), this.base.getMonth()+n,1);
    } else if (this.view==='week') {
      this.base.setDate(this.base.getDate()+7*n);
      this.base = new Date(this.base);
    } else {
      this.base.setDate(this.base.getDate()+1*n);
      this.base = new Date(this.base);
    }
  }

  private startOfWeek(d:Date):Date{
    const dow = (d.getDay()+6)%7;
    const m = new Date(d);
    m.setDate(d.getDate()-dow);
    return m;
  }
}
