import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';

import { AuthService } from '../../services';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private authSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSubscription = this.authService
      .getAuthStatusListener()
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  onSignin(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.loginUser(form.value.email, form.value.password);
  }
}
