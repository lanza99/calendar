import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { PreviewNoteComponent } from '../preview-note/preview-note.component';
import { NoteInterface } from '../note-interface';
import { NotesService } from '../notes.service';
import { CommonModule, NgFor } from '@angular/common';


@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [RouterModule, NavbarComponent, PreviewNoteComponent, CommonModule, NgFor],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css'
})

export class NotesComponent {
  notesService: NotesService = inject(NotesService);
  testNotesList : NoteInterface[] = [];

  constructor () {

    this.notesService.getAllNotes().then((testNotesList : NoteInterface[]) => {
        this.testNotesList = testNotesList;
      }
    )



  }


}
