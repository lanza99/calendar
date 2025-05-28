import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventFormComponent, CalendarEvent } from './event-form.component';
import { FormsModule } from '@angular/forms';

describe('EventFormComponent', () => {
  let component: EventFormComponent;
  let fixture: ComponentFixture<EventFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFormComponent, FormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit newEvent when form is valid', () => {
    spyOn(component.newEvent, 'emit');
    component.title = 'Test Event';
    component.date = '2025-06-01';
    component.startTime = '10:00';
    component.endTime = '11:00';
    component.allDay = false;
    component.recurrence = 'weekly';
    component.reminder = 15;

    component.createEvent();

    expect(component.newEvent.emit).toHaveBeenCalled();
    const emittedEvent: CalendarEvent = (component.newEvent.emit as jasmine.Spy).calls.first().args[0];
    expect(emittedEvent.title).toBe('Test Event');
    expect(emittedEvent.date).toEqual(new Date('2025-06-01'));
    expect(emittedEvent.startTime).toBe('10:00');
    expect(emittedEvent.endTime).toBe('11:00');
    expect(emittedEvent.allDay).toBeFalse();
    expect(emittedEvent.recurrence).toBe('weekly');
    expect(emittedEvent.reminder).toBe(15);
  });

  it('should emit null times if allDay is true', () => {
    spyOn(component.newEvent, 'emit');
    component.title = 'All Day Event';
    component.date = '2025-07-01';
    component.allDay = true;
    component.recurrence = '';
    component.reminder = 0;

    component.createEvent();

    expect(component.newEvent.emit).toHaveBeenCalled();
    const emittedEvent: CalendarEvent = (component.newEvent.emit as jasmine.Spy).calls.first().args[0];
    expect(emittedEvent.title).toBe('All Day Event');
    expect(emittedEvent.date).toEqual(new Date('2025-07-01'));
    expect(emittedEvent.startTime).toBeNull();
    expect(emittedEvent.endTime).toBeNull();
    expect(emittedEvent.allDay).toBeTrue();
    expect(emittedEvent.recurrence).toBeUndefined();
    expect(emittedEvent.reminder).toBe(0);
  });

  it('should not emit if title is missing', () => {
    spyOn(component.newEvent, 'emit');
    component.title = '';
    component.date = '2025-08-01';
    component.createEvent();
    expect(component.newEvent.emit).not.toHaveBeenCalled();
  });

  it('should not emit if date is missing', () => {
    spyOn(component.newEvent, 'emit');
    component.title = 'Title';
    component.date = '';
    component.createEvent();
    expect(component.newEvent.emit).not.toHaveBeenCalled();
  });
});
