import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GitHubUser } from '../../../core/models/github.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-item',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-item.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserItemComponent {
  @Input() user!: GitHubUser;
}
