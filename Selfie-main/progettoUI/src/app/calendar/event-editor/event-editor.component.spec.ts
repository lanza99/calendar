import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEditorComponent } from './event-editor.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('EventEditorComponent', () => {
  let component: EventEditorComponent;
  let fixture: ComponentFixture<EventEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EventEditorComponent,
        RouterTestingModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
