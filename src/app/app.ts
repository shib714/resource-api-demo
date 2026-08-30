import { Component, signal } from '@angular/core';
import { Nav } from './common/nav/nav';

@Component({
  imports: [Nav],
  selector: 'app-root',
  styleUrl: './app.scss',
  template: '<app-nav></app-nav>',
})
export class App {
  protected readonly title = signal('Resource API Explorer');
}
