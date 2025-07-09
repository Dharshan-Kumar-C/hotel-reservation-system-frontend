import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  reservationId?: number;
  guest: any;
  room: any;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = 'http://localhost:9090/api/reservations';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('guest-jwt') || localStorage.getItem('jwt');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAll(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  create(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation, { headers: this.getAuthHeaders() });
  }

  update(id: number, reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/put/${id}`, reservation, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers: this.getAuthHeaders() });
  }

  getPaged(
    page = 0, size = 5, sortBy = 'checkInDate', sortDir = 'asc',
    guestName?: string, roomType?: string, status?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    if (guestName && guestName.trim()) params = params.set('guestName', guestName.trim());
    if (roomType && roomType.trim()) params = params.set('roomType', roomType.trim());
    if (status && status.trim()) params = params.set('status', status.trim());
    return this.http.get<any>(`${this.apiUrl}/paged`, { headers: this.getAuthHeaders(), params });
  }
} 