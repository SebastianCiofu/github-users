export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface GitHubUser {
  id: string;
  login: string;
  avatarUrl: string;
  url?: string;
  type?: string;
}

export interface GitHubUserDetails extends GitHubUser {
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: { totalCount: number };
  following: { totalCount: number };
  repositories: {
    totalCount: number;
    nodes: Repository[];
    pageInfo: PageInfo;
  };
}

export interface Repository {
  id: string;
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string } | null;
  isPrivate: boolean;
  updatedAt: string;
}

export interface SearchUsersResponse {
  search: {
    userCount: number;
    pageInfo: PageInfo;
    edges: Array<{ node: GitHubUser }>;
  };
}

export interface UserDetailsResponse {
  user: GitHubUserDetails & { __typename: string };
}

export interface UsersQueryVariables {
  first: number;
  after?: string | null;
}

export interface UserDetailsQueryVariables {
  login: string;
  repoFirst: number;
  repoAfter?: string | null;
}

export interface SearchUsersResult {
  users: GitHubUser[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface UserDetailsResult {
  user: GitHubUserDetails;
  repositories: Repository[];
  repositoriesPageInfo: PageInfo;
  repositoriesTotalCount: number;
}
