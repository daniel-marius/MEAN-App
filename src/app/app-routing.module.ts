import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { PathResolveService } from './services/';
import { AuthGuard } from './guards/';
import { paths } from './shared/utilities';

const routes: Routes = [
  { path: paths.home, redirectTo: paths.list, pathMatch: 'full' },
  { path: paths.list, component: PostListComponent },
  {
    path: paths.create,
    component: PostCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${paths.edit}/:postId`,
    component: PostCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.nodule').then((m) => m.AuthModule),
  },
  {
    path: '**',
    resolve: { paths: PathResolveService },
    component: NotFoundComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
