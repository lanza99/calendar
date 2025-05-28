import { Component, ElementRef, inject, Input, Renderer2, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { NotesService } from '../notes.service';
import { NoteInterface } from '../note-interface';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: "./note-editor.component.html",
  styleUrl: './note-editor.component.css'
})


export class NoteEditorComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  notesService = inject(NotesService);
  note : NoteInterface | undefined;

  constructor() {
    const noteId = Number(this.route.snapshot.params['id']);
    
    this.notesService.getNoteById(noteId).then((note) => {
      this.note = note;
    })

  
  }



  showPopup() {
    console.log("ziopera")
    /* this.popupElement.setStyle("da"); */
    
  }





}

