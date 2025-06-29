import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
registerLocaleData(localeIt);

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/home/home.component';
import { CalendarComponent } from './app/calendar/calendar.component';
import { MonthComponent } from './app/calendar/month/month.component';
import { WeekComponent } from './app/calendar/week/week.component';
import { DayComponent } from './app/calendar/day/day.component';
import { LoginpageComponent } from './app/loginpage/loginpage.component';
import { NotesComponent } from './app/notes/notes.component';
import { NoteEditorComponent } from './app/note-editor/note-editor.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' },
    ...appConfig.providers
  ]
})
  .catch(err => console.error(err));


/*bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
  
  {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home',           component: HomeComponent,       title: 'Selfie.' },
      { path: 'login',          component: LoginpageComponent,  title: 'Login.' },
      { path: 'notes',          component: NotesComponent,      title: 'Notes.' },
      { path: 'note-editor/:id', component: NoteEditorComponent, title: 'NoteEditor.' },
      {
        path: 'calendar',
        component: CalendarComponent,
        children: [
          { path: '',      redirectTo: 'month', pathMatch: 'full' },
          { path: 'month', component: MonthComponent },
          { path: 'week',  component: WeekComponent },
          { path: 'day',   component: DayComponent }
        ]
      },
      { path: '**', redirectTo: 'home' }
    ]),
    // anziché `provide(LOCALE_ID, 'it')`, usiamo questa sintassi:
    { provide: LOCALE_ID, useValue: 'it' }
  ]
}*/

