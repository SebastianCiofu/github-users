import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { GET_USER_DETAILS_QUERY, SEARCH_USERS_QUERY } from '../graphql/github.queries';
import { SearchUsersResponse, SearchUsersResult, UserDetailsResponse, UserDetailsResult } from '../models/github.models';

@Injectable({ providedIn: 'root' })
export class GithubService {
  private readonly apollo = inject(Apollo);

  searchUsers(first = 10, after?: string | null, searchTerm?: string): Observable<SearchUsersResult> {
    const query = searchTerm ? `type:user ${searchTerm}` : 'type:user';
    return this.apollo
      .query<SearchUsersResponse>({
        query: SEARCH_USERS_QUERY,
        variables: { query, first, after },
      })
      .pipe(
        map(({ data }) => {
          if (!data?.search) throw new Error('No results');

          return {
            users: data.search.edges.map(({ node }) => ({
              id: node.id,
              login: node.login,
              avatarUrl: node.avatarUrl,
              url: node.url,
            })),
            pageInfo: data.search.pageInfo,
            totalCount: data.search.userCount,
          };
        }),
      );
  }

  getUserDetails(username: string, repoFirst = 10, repoAfter?: string | null): Observable<UserDetailsResult> {
    return this.apollo
      .query<UserDetailsResponse>({
        query: GET_USER_DETAILS_QUERY,
        variables: { login: username, repoFirst, repoAfter },
      })
      .pipe(
        map(({ data }) => {
          if (!data?.user) throw new Error('User not found');

          return {
            user: { ...data.user, type: data.user.__typename },
            repositories: data.user.repositories.nodes,
            repositoriesPageInfo: data.user.repositories.pageInfo,
            repositoriesTotalCount: data.user.repositories.totalCount,
          };
        }),
      );
  }
}
