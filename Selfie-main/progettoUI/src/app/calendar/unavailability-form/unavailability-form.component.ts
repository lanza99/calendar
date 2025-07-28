import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-unavailability-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unavailability-form.component.html',
  styleUrls: ['./unavailability-form.component.css']
})
export class UnavailabilityFormComponent {
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  showForm = false;

  startDate: string = '';
  startTime: string = '';
  endDate: string = '';
  endTime: string = '';
  recurrence: 'none' | 'daily' | 'weekly' = 'none';
  note: string = '';

  openForm() {
    this.reset();  // Pulisce sempre il form prima di aprirlo
    this.showForm = true;
  }

  openFormWith(item: any) {
    this.startDate = item.startDate?.split('T')[0] || '';
    this.startTime = item.startDate?.split('T')[1]?.slice(0, 5) || '';
    this.endDate = item.endDate?.split('T')[0] || '';
    this.endTime = item.endDate?.split('T')[1]?.slice(0, 5) || '';
    this.recurrence = item.recurrence;
    this.note = item.note || '';
    this.showForm = true;
  }

  submit() {
    const start = new Date(`${this.startDate}T${this.startTime}`);
    const end = new Date(`${this.endDate}T${this.endTime}`);

    this.submitted.emit({
      startDate: start,
      endDate: end,
      recurrence: this.recurrence,
      note: this.note
    });

    this.reset();
  }

  cancel() {
    this.reset();
    this.cancelled.emit();
  }

  reset() {
    this.startDate = '';
    this.startTime = '';
    this.endDate = '';
    this.endTime = '';
    this.recurrence = 'none';
    this.note = '';
    this.showForm = false;
  }
}
