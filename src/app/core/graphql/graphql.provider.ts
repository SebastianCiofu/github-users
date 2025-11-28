import { inject, Provider } from '@angular/core';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export function createApollo() {
  const httpLink = inject(HttpLink);

  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: new HttpHeaders().set(
        'Authorization',
        `Bearer ${environment.githubToken}`,
      ),
    });
    return forward(operation);
  });

  return {
    link: authLink.concat(
      httpLink.create({ uri: 'https://api.github.com/graphql' }),
    ),
    cache: new InMemoryCache(),
  };
}

export const graphqlProviders: Provider[] = [
  Apollo,
  { provide: APOLLO_OPTIONS, useFactory: createApollo, deps: [HttpLink] },
];
