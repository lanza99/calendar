import { Component } from '@angular/core';
import { PreviewNoteComponent } from '../preview-note/preview-note.component';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { MonthComponent } from '../calendar/month/month.component';  // **IMPORTA QUI**


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PreviewNoteComponent, RouterModule, NavbarComponent, MonthComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})


export class HomeComponent {
    // Data di riferimento per il preview
  today = new Date();
  
  noop() {}   // serve per catturare l’output del newEvent senza errori
}


