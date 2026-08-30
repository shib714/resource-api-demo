import { computed, effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Theme {

  private appTheme = signal<string>('system');

    private themes: AppTheme[] = [
        { name: 'light', icon: 'light_mode' },
        { name: 'dark', icon: 'dark_mode' },
        { name: 'system', icon: 'desktop_windows' },
    ];

    selectedTheme = computed(() =>
        this.themes.find((theme) => theme.name === this.appTheme())
    );

    getThemes() {
        return this.themes;
    }

    setTheme(theme: string) {
        this.appTheme.set(theme);
    }

    constructor() {
        effect(() => {
            const appTheme = this.appTheme();
            const colorScheme = appTheme === 'system' ? 'light dark' : appTheme;
            //document.body.style.setProperty('color-scheme', colorScheme);
            document.body.style.colorScheme = colorScheme;
        });
    }
}
export interface AppTheme {
    name: string;
    icon: string;
}