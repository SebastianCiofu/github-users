import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Repository } from '../../../core/models/github.models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-repo-item',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './repo-item.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepoItemComponent {
  @Input() repo!: Repository;
}
