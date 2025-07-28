import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Unavailability } from '../../services/unavailability.service';

@Component({
  selector: 'app-unavailability-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unavailability-form.component.html',
  styleUrls: ['./unavailability-form.component.css']
})
export class UnavailabilityFormComponent {
  @Input() allUnavailability: Unavailability[] = [];

  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() requestDelete = new EventEmitter<string>();
  @Output() requestEdit = new EventEmitter<Unavailability>();

  showForm = false;
  mode: 'add' | 'list' = 'add';

  // campi del form
  startDate: string = '';
  startTime: string = '';
  endDate: string = '';
  endTime: string = '';
  recurrence: 'none' | 'daily' | 'weekly' = 'none';
  note: string = '';

  openForm() {
    this.reset();
    this.showForm = true;
    this.mode = 'add';
  }

  openFormWith(item: any) {
    this.startDate = item.startDate?.split('T')[0] || '';
    this.startTime = item.startDate?.split('T')[1]?.slice(0, 5) || '';
    this.endDate = item.endDate?.split('T')[0] || '';
    this.endTime = item.endDate?.split('T')[1]?.slice(0, 5) || '';
    this.recurrence = item.recurrence;
    this.note = item.note || '';
    this.showForm = true;
    this.mode = 'add';
  }

  submit() {
    const start = new Date(`${this.startDate}T${this.startTime || '00:00'}`);
    const end = new Date(`${this.endDate}T${this.endTime || '00:00'}`);

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
    this.mode = 'add';
  }

  // chiamato dalla lista interna
  editExisting(item: Unavailability) {
    this.openFormWith(item);
  }

  deleteExisting(id: string) {
    if (confirm('Vuoi eliminare questa indisponibilità?')) {
      this.requestDelete.emit(id);
    }
  }
}
