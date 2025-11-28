import { Routes } from '@angular/router';
import { UsersListComponent } from './features/users-list/users-list.component';

export const routes: Routes = [
  {
    path: '',
    component: UsersListComponent,
  },
  {
    path: 'user/:username',
    loadComponent: () =>
      import('./features/user-details/user-details.component').then(
        (m) => m.UserDetailsComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
