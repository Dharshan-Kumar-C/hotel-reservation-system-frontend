import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:9090/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        localStorage.setItem('jwt', response.token);
      }),
      catchError(this.handleError)
    );
  }

  logout() {
    localStorage.removeItem('jwt');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }

  private handleError(error: HttpErrorResponse) {
    let msg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      msg = `Error: ${error.error.message}`;
    } else if (error.status === 401) {
      msg = 'Invalid username or password.';
    } else if (error.error && error.error.message) {
      msg = error.error.message;
    }
    return throwError(() => msg);
  }
} 