import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GitHubUserDetails } from '../../../core/models/github.models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
  @Input() user!: GitHubUserDetails;
}
