import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { GitHubUserDetails } from '../../core/models/github.models';
import { PageInfo, Repository } from '../../core/models/github.models';
import { GithubService } from '../../core/services/github.service';
import { ErrorComponent } from '../../shared/error/error.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { RepoItemComponent } from './repo-item/repo-item.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

interface UserDetailsState {
  user: GitHubUserDetails | null;
  repos: Repository[];
  repoCount: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
}

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    HeaderComponent,
    LoadingSpinnerComponent,
    ErrorComponent,
    RepoItemComponent,
    UserProfileComponent,
    AsyncPipe,
  ],
  templateUrl: './user-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private githubService = inject(GithubService);
  private destroyRef = inject(DestroyRef);
  private observer?: IntersectionObserver;

  private pageInfo: PageInfo | null = null;

  @ViewChild('scrollTrigger') scrollTrigger?: ElementRef<HTMLDivElement>;

  private readonly userNameSubject = new BehaviorSubject<string>('');
  private readonly stateSubject = new BehaviorSubject<UserDetailsState>({
    user: null,
    repos: [],
    repoCount: 0,
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: false,
  });
  public readonly state$: Observable<UserDetailsState> =
    this.stateSubject.asObservable();

  ngOnInit() {
    this.route.paramMap
      .pipe(
        tap(() =>
          this.stateSubject.next({
            ...this.stateSubject.value,
            loading: true,
            error: null,
          }),
        ),
        filter((params) => {
          this.userNameSubject.next(params.get('username') || '');
          return true;
        }),
        switchMap(() =>
          this.githubService
            .getUserDetails(this.userNameSubject.value, 10)
            .pipe(
              catchError((e) => {
                this.stateSubject.next({
                  ...this.stateSubject.value,
                  loading: false,
                  error: e.message,
                });
                return of(null);
              }),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        if (data) {
          this.pageInfo = data.repositoriesPageInfo;
          this.stateSubject.next({
            ...this.stateSubject.value,
            user: data.user,
            repos: data.repositories,
            repoCount: data.repositoriesTotalCount,
            hasMore: data.repositoriesPageInfo.hasNextPage,
            loading: false,
          });
          this.observeTrigger();
        }
      });
  }

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private setupInfiniteScroll() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const state = this.stateSubject.value;
        if (
          entries[0].isIntersecting &&
          !state.loadingMore &&
          !state.loading &&
          state.hasMore
        ) {
          this.loadMore();
        }
      },
      { threshold: 0.1 },
    );
  }

  private observeTrigger() {
    setTimeout(() => {
      if (this.scrollTrigger?.nativeElement) {
        this.observer?.disconnect();
        this.observer?.observe(this.scrollTrigger.nativeElement);
      }
    });
  }

  loadMore() {
    if (!this.pageInfo?.endCursor) return;

    this.stateSubject.next({ ...this.stateSubject.value, loadingMore: true });

    this.githubService
      .getUserDetails(this.userNameSubject.value, 10, this.pageInfo.endCursor)
      .pipe(
        catchError((e) => {
          this.stateSubject.next({
            ...this.stateSubject.value,
            loadingMore: false,
            error: e.message,
          });
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res) {
          this.pageInfo = res.repositoriesPageInfo;
          this.stateSubject.next({
            ...this.stateSubject.value,
            repos: [...this.stateSubject.value.repos, ...res.repositories],
            hasMore: res.repositoriesPageInfo.hasNextPage,
            loadingMore: false,
          });
          this.observeTrigger();
        }
      });
  }
}
