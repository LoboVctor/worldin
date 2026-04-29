import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';

export interface UserData {
  cpf: string;
  nome: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: UserData;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private usersUrl = 'http://localhost:3000/users';
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  private currentUserSubject = new BehaviorSubject<UserData | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.startInactivityMonitor();
  }

  private getStoredUser(): UserData | null {
    const user = localStorage.getItem('worldin_user');
    return user ? JSON.parse(user) : null;
  }

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap(response => {
        localStorage.setItem('worldin_token', response.access_token);
        localStorage.setItem('worldin_user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        this.resetInactivityTimer();
      })
    );
  }

  register(data: { nome: string; cpf: string; email: string; senha: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('worldin_token');
    localStorage.removeItem('worldin_user');
    this.currentUserSubject.next(null);
    this.clearInactivityTimer();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('worldin_token');
  }

  getCurrentUser(): UserData | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isGerente(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'GERENTE';
  }

  updateProfile(cpf: string, data: { nome?: string; email?: string }): Observable<any> {
    return this.http.patch(`${this.usersUrl}/${cpf}/profile`, data).pipe(
      tap((updatedUser: any) => {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const newUser = { ...currentUser, ...updatedUser };
          localStorage.setItem('worldin_user', JSON.stringify(newUser));
          this.currentUserSubject.next(newUser);
        }
      })
    );
  }

  changePassword(cpf: string, senhaAtual: string, novaSenha: string): Observable<any> {
    return this.http.patch(`${this.usersUrl}/${cpf}/password`, { senhaAtual, novaSenha });
  }

  deleteAccount(cpf: string, senha: string): Observable<any> {
    return this.http.delete(`${this.usersUrl}/${cpf}`, { body: { senha } });
  }

  // Inactivity monitoring
  startInactivityMonitor(): void {
    if (typeof window === 'undefined') return;
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer(), { passive: true });
    });
    this.resetInactivityTimer();
  }

  resetInactivityTimer(): void {
    this.clearInactivityTimer();
    if (this.isLoggedIn()) {
      this.inactivityTimer = setTimeout(() => {
        this.logout();
      }, this.INACTIVITY_TIMEOUT);
    }
  }

  clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}
