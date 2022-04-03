import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Auth } from '../../models';

const BASE_URL = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string = '';
  private tokenTimer: any;
  private userId: string | null = null;
  private authStatusListener: Subject<boolean> = new Subject<boolean>();
  private isAuthenticated: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string {
    return this.token;
  }

  getIsAuth(): boolean {
    return this.isAuthenticated;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const auth: Auth = { email, password };
    this.http.post(`${BASE_URL}/signup`, auth).subscribe((response) => {
      if (Object.keys(response).length) {
        this.router.navigate(['/']);
      }
    });
  }

  loginUser(email: string, password: string) {
    const auth: Auth = { email, password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        `${BASE_URL}/signin`,
        auth
      )
      .subscribe({
        next: (response) => {
          this.token = response.token;
          if (this.token) {
            const expiresIn: number = response.expiresIn;
            this.setAuthTimer(expiresIn);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authStatusListener.next(true);
            this.saveToken(
              this.token,
              new Date(new Date().getTime() + expiresIn * 1000),
              this.userId
            );
            this.router.navigate(['/']);
          }
        },
        error: () => {
          this.authStatusListener.next(false);
        },
      });
  }

  logout(): void {
    this.token = '';
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = '';
    this.router.navigate(['/']);
  }

  autoAuthUser(): void {
    const authData = this.getAuthData();
    if (!authData) {
      return;
    }
    const now = new Date();
    // milliseconds
    const expiresIn = authData.expirationDate.getTime() - now.getTime();
    console.log(authData);
    if (expiresIn > 0) {
      this.token = authData.token;
      this.isAuthenticated = true;
      this.userId = authData.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private setAuthTimer(duration: number): void {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveToken(token: string, expirationDate: Date, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return;
    }

    return { token, expirationDate: new Date(expirationDate), userId };
  }
}
