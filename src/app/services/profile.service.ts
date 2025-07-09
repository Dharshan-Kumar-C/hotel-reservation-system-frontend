import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map, catchError, of } from 'rxjs';
import { Guest } from './guest-auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = 'http://localhost:9090/api/guests';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('guest-jwt');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProfileByEmail(email: string): Observable<Guest> {
    return this.http.get<Guest>(`${this.apiUrl}/profile/${email}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  updateProfile(guestId: number, guest: Guest): Observable<Guest> {
    return this.http.put<Guest>(`${this.apiUrl}/put/${guestId}`, guest, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  getCurrentGuestName(): Observable<string> {
    const token = localStorage.getItem('guest-jwt');
    if (!token) return of('Guest');
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.sub;
      if (!email) return of('Guest');
      return this.getProfileByEmail(email).pipe(
        map(guest => guest.name || 'Guest'),
        catchError(() => of('Guest'))
      );
    } catch {
      return of('Guest');
    }
  }
} 