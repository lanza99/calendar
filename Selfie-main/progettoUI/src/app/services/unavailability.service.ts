import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface Unavailability {
  _id?: string;  // 👈 Aggiungi questa riga
  user: string;
  startDate: Date;
  endDate: Date;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  note?: string;
}


@Injectable({ providedIn: 'root' })
export class UnavailabilityService {
  private apiUrl = 'http://localhost:8080/unavailability';

  constructor(private http: HttpClient) {}

  getAll(user: string): Promise<Unavailability[]> {
    return lastValueFrom(this.http.get<Unavailability[]>(`${this.apiUrl}/${user}`));
  }

  addOne(data: Unavailability): Promise<Unavailability> {
    return lastValueFrom(this.http.post<Unavailability>(this.apiUrl, data));
  }

  deleteOne(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  updateOne(id: string, data: Partial<Unavailability>): Promise<Unavailability> {
  return lastValueFrom(this.http.patch<Unavailability>(`${this.apiUrl}/${id}`, data));
}


}
