import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, switchMap } from 'rxjs';

export interface GuestPayment {
  paymentId?: number;
  reservation: any;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentGuestService {
  private apiUrl = 'http://localhost:9090/api/payments';
  private guestApiUrl = 'http://localhost:9090/api/guests';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('guest-jwt');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  private getGuestIdFromToken(): number | null {
    const token = localStorage.getItem('guest-jwt');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.guestId) return payload.guestId;
      if (payload.id) return payload.id;
      if (payload.sub && !isNaN(Number(payload.sub))) return Number(payload.sub);
      return null;
    } catch {
      return null;
    }
  }

  private getEmailFromToken(): string | null {
    const token = localStorage.getItem('guest-jwt');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }

  private getByGuestId(guestId: number): Observable<GuestPayment[]> {
    return this.http.get<GuestPayment[]>(`${this.apiUrl}/guest/${guestId}`, { headers: this.getAuthHeaders() });
  }

  getByCurrentGuest(): Observable<GuestPayment[]> {
    const guestId = this.getGuestIdFromToken();
    if (guestId) {
      return this.getByGuestId(guestId);
    }
    // fallback: get email from token, fetch guest profile, then payments
    const email = this.getEmailFromToken();
    if (!email) return throwError(() => 'Guest ID or email not found in token');
    return this.http.get<any>(`${this.guestApiUrl}/profile/${email}`, { headers: this.getAuthHeaders() }).pipe(
      switchMap((guest) => {
        if (!guest || !guest.guestId) return throwError(() => 'Guest not found for email');
        return this.getByGuestId(guest.guestId);
      })
    );
  }
} 