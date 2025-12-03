import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';

  private readonly isDarkSubject = new BehaviorSubject<boolean>(this.getInitialTheme());
  public readonly isDark$ = this.isDarkSubject.asObservable();

  constructor() {
    this.isDark$.subscribe((isDark) => {
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDarkSubject.next(!this.isDarkSubject.value);
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
