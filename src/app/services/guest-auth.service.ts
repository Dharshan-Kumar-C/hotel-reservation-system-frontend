import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Guest {
  guestId?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface GuestLoginRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class GuestAuthService {
  private apiUrl = 'http://localhost:9090/api/guests';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<JwtResponse> {
    const loginRequest: GuestLoginRequest = { email, password };
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap(response => {
        localStorage.setItem('guest-jwt', response.token);
      }),
      catchError(this.handleError)
    );
  }

  register(guest: Guest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, guest).pipe(
      catchError(this.handleError)
    );
  }

  logout() {
    localStorage.removeItem('guest-jwt');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('guest-jwt');
  }

  private handleError(error: HttpErrorResponse) {
    let msg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      msg = `Error: ${error.error.message}`;
    } else if (error.status === 401) {
      msg = 'Invalid email or password.';
    } else if (error.status === 400) {
      msg = 'Registration failed. Please check your input.';
    } else if (error.status === 500) {
      // Handle backend exceptions like "Email already registered"
      if (error.error && typeof error.error === 'string' && error.error.includes('already registered')) {
        msg = 'Email is already registered. Please use a different email or try logging in.';
      } else {
        msg = 'Registration failed. Please try again.';
      }
    } else if (error.error && error.error.message) {
      msg = error.error.message;
    }
    return throwError(() => msg);
  }
} 