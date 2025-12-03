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
import { GitHubUser, PageInfo } from '../../core/models/github.models';
import { HeaderComponent } from '../../shared/header/header.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ErrorComponent } from '../../shared/error/error.component';
import { UserItemComponent } from './user-item/user-item.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, debounceTime, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { GithubService } from '../../core/services/github.service';
import { FormsModule } from '@angular/forms';

interface UsersState {
  users: GitHubUser[];
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  searchTerm: string;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [HeaderComponent, LoadingSpinnerComponent, ErrorComponent, UserItemComponent, AsyncPipe, FormsModule],
  templateUrl: './users-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit, AfterViewInit, OnDestroy {
  private githubService = inject(GithubService);
  private destroyRef = inject(DestroyRef);
  private pageInfo: PageInfo | null = null;
  private observer?: IntersectionObserver;

  @ViewChild('scrollTrigger') scrollTrigger?: ElementRef<HTMLDivElement>;

  private searchSubject = new Subject<string>();
  private readonly stateSubject = new BehaviorSubject<UsersState>({
    users: [],
    totalCount: 0,
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: false,
    searchTerm: '',
  });

  readonly state$: Observable<UsersState> = this.stateSubject.asObservable();

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        tap((searchTerm) => {
          this.stateSubject.next({
            ...this.stateSubject.value,
            loading: true,
            error: null,
            searchTerm,
          });
          this.pageInfo = null;
        }),
        switchMap((searchTerm) =>
          this.githubService.searchUsers(10, null, searchTerm).pipe(
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
      .subscribe((res) => {
        if (res) {
          this.pageInfo = res.pageInfo;
          this.stateSubject.next({
            ...this.stateSubject.value,
            users: res.users,
            totalCount: res.totalCount,
            hasMore: res.pageInfo.hasNextPage,
            loading: false,
          });
          this.observeTrigger();
        }
      });

    this.searchSubject.next('');
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
        if (entries[0].isIntersecting && !state.loadingMore && !state.loading && state.hasMore) {
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

  onSearch(event$: Event) {
    const textValue = (event$.target as HTMLInputElement).value;
    this.searchSubject.next(textValue);
  }

  loadMore() {
    if (!this.pageInfo?.endCursor) return;

    this.stateSubject.next({ ...this.stateSubject.value, loadingMore: true });

    this.githubService
      .searchUsers(10, this.pageInfo.endCursor, this.stateSubject.value.searchTerm)
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
          this.pageInfo = res.pageInfo;
          this.stateSubject.next({
            ...this.stateSubject.value,
            users: [...this.stateSubject.value.users, ...res.users],
            hasMore: res.pageInfo.hasNextPage,
            loadingMore: false,
          });
          this.observeTrigger();
        }
      });
  }
}
