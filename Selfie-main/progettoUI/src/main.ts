import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter }      from '@angular/router';
import { AppComponent }       from './app/app.component';
import { HomeComponent }      from './app/home/home.component';
import { CalendarComponent }  from './app/calendar/calendar.component';
import { MonthComponent }     from './app/calendar/month/month.component';
import { WeekComponent }      from './app/calendar/week/week.component';
import { DayComponent }       from './app/calendar/day/day.component';
import { LoginService } from './app/login.service';
import { NotesComponent } from './app/notes/notes.component';
import { NoteEditorComponent } from './app/note-editor/note-editor.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '',      component: HomeComponent },       // ← Home PRIMA
      { path: 'login', component: LoginService },
      { path: 'notes', component: NotesComponent },
      { path: 'note-editor/:id', component: NoteEditorComponent },

      {
        path: 'calendar',
        component: CalendarComponent,
        children: [
          { path: '', redirectTo: 'month', pathMatch: 'full' },
          { path: 'month', component: MonthComponent },
          { path: 'week',  component: WeekComponent },
          { path: 'day',   component: DayComponent }
        ]
      },

      { path: '**', redirectTo: '' }
    ])
  ]
})
.catch(err => console.error(err));
