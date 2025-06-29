import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Output() onDeleteSingle = new EventEmitter<void>();
  @Output() onDeleteSeries = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  deleteSingle() {
    this.onDeleteSingle.emit();
  }

  deleteSeries() {
    this.onDeleteSeries.emit();
  }

  cancel() {
    this.onCancel.emit();
  }
}
