import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { paths } from '../shared/utilities';

const routes: Routes = [
  { path: paths.signin, component: SigninComponent },
  { path: paths.signup, component: SignupComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class AuthRoutingModule {}
