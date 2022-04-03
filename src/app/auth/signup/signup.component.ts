import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';

import { AuthService } from '../../services';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
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

  onSignup(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    const { email, password } = form.value;
    this.isLoading = true;
    this.authService.createUser(email, password);
  }
}
