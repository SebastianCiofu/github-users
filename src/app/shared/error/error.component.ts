import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {
  @Input() error: string | null = null;
}
