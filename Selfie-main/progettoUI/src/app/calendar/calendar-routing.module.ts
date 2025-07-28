import { Routes, RouterModule } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { MonthComponent } from './month/month.component';
import { WeekComponent } from './week/week.component';
import { DayComponent } from './day/day.component';
import { EventEditorComponent } from './event-editor/event-editor.component';


const routes: Routes = [
  {
    path: 'calendar',
    component: CalendarComponent,
    children: [
      { path: '', redirectTo: 'month', pathMatch: 'full' },
      { path: 'month', component: MonthComponent },
      { path: 'week', component: WeekComponent },
      { path: 'day', component: DayComponent },
      { path: 'event/new', component: EventEditorComponent },
      { path: 'event/edit/:id', component: EventEditorComponent },
    ],
  },
];

export const CalendarRoutingModule = RouterModule.forChild(routes);
