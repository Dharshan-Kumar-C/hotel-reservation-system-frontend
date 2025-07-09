import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Guest {
  guestId?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class GuestService {
  private apiUrl = 'http://localhost:9090/api/guests';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAll(): Observable<Guest[]> {
    return this.http.get<Guest[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getById(id: number): Observable<Guest> {
    return this.http.get<Guest>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  create(guest: Guest): Observable<Guest> {
    return this.http.post<Guest>(this.apiUrl, guest, { headers: this.getAuthHeaders() });
  }

  update(id: number, guest: Guest): Observable<Guest> {
    return this.http.put<Guest>(`${this.apiUrl}/put/${id}`, guest, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers: this.getAuthHeaders() });
  }

  getPaged(page = 0, size = 5, sortBy = 'name', sortDir = 'asc', search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<any>(`${this.apiUrl}/paged`, { headers: this.getAuthHeaders(), params });
  }
}