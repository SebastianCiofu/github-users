import { gql } from 'apollo-angular';

export const SEARCH_USERS_QUERY = gql`
  query SearchUsers($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: USER, first: $first, after: $after) {
      userCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ... on User {
            id
            login
            avatarUrl
            url
          }
        }
      }
    }
  }
`;

export const GET_USER_DETAILS_QUERY = gql`
  query GetUserDetails($login: String!, $repoFirst: Int!, $repoAfter: String) {
    user(login: $login) {
      id
      login
      avatarUrl
      url
      name
      bio
      company
      location
      __typename
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(
        first: $repoFirst
        after: $repoAfter
        orderBy: { field: UPDATED_AT, direction: DESC }
        ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          description
          url
          stargazerCount
          forkCount
          isPrivate
          updatedAt
          primaryLanguage {
            name
          }
        }
      }
    }
  }
`;
