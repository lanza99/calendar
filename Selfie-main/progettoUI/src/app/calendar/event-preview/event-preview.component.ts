import { Component, Input } from '@angular/core';
import { CalendarEvent } from '../services/event.service';

@Component({
  selector: 'app-event-preview',
  standalone: true,
  templateUrl: './event-preview.component.html',
  styleUrls: ['./event-preview.component.css'],
})
export class EventPreviewComponent {
  @Input() event!: CalendarEvent;
}
