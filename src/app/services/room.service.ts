import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Room {
  roomId?: number;
  roomNumber: string;
  type: string;
  amount: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private apiUrl = 'http://localhost:9090/api/rooms';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('guest-jwt') || localStorage.getItem('jwt');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  create(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room, { headers: this.getAuthHeaders() });
  }

  update(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/put/${id}`, room, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers: this.getAuthHeaders() });
  }

  getPaged(page = 0, size = 5, sortBy = 'amount', sortDir = 'asc', type?: string, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    if (type && type.trim()) {
      params = params.set('type', type.trim());
    }
    if (status && status.trim()) {
      params = params.set('status', status.trim());
    }
    return this.http.get<any>(`${this.apiUrl}/paged`, { headers: this.getAuthHeaders(), params });
  }

  getRoomsByType(type: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/type/${encodeURIComponent(type)}`, { headers: this.getAuthHeaders() });
  }
} 