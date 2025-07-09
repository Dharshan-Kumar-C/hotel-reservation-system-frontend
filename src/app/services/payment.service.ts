import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
  paymentId?: number;
  reservation: any;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = 'http://localhost:9090/api/payments';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt') || localStorage.getItem('guest-jwt');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  create(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment, { headers: this.getAuthHeaders() });
  }

  update(id: number, payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/put/${id}`, payment, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers: this.getAuthHeaders() });
  }

  getPaged(
    page = 0, size = 5, sortBy = 'amountPaid', sortDir = 'asc',
    reservationId?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    if (reservationId && reservationId.trim()) params = params.set('reservationId', reservationId.trim());
    return this.http.get<any>(`${this.apiUrl}/paged`, { headers: this.getAuthHeaders(), params });
  }
} 