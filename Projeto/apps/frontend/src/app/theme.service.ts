import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(true);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    const saved = localStorage.getItem('worldin_theme');
    const isDark = saved !== 'light';
    this.isDarkMode.next(isDark);
    this.applyTheme(isDark);
  }

  toggle(): void {
    const newVal = !this.isDarkMode.value;
    this.isDarkMode.next(newVal);
    localStorage.setItem('worldin_theme', newVal ? 'dark' : 'light');
    this.applyTheme(newVal);
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}
