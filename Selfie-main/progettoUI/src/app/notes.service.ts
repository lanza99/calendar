import { Injectable } from '@angular/core';
import { NoteInterface } from './note-interface';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})

export class NotesService {
  apiUrl: string = 'http://localhost:4316'

  constructor(private http: HttpClient) { }

  async getAllNotes(): Promise<NoteInterface[]> {
    const data = await fetch(`${this.apiUrl}/getAllNotes`);
    return await data.json() ?? [];
  }

  async getNoteById( id : Number) : Promise<NoteInterface | undefined> {
    const data = fetch(`${this.apiUrl}/getNote/${id}`);
    return (await data).json() ?? {};

  }  


}