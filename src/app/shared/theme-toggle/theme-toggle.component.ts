import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [],
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
  @Input() isChecked: boolean | null = false;
  @Output() toggleEvent = new EventEmitter<void>();
}
