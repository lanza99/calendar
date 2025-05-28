import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventPreviewComponent } from './event-preview.component';

describe('EventPreviewComponent', () => {
  let component: EventPreviewComponent;
  let fixture: ComponentFixture<EventPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPreviewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EventPreviewComponent);
    component = fixture.componentInstance;
    component.event = {
      id: '1', title: 'Test', date: '2025-05-20',
      allDay: true, reminderMinutes: 0, recurrence: 'none',
      color: '#fff'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
