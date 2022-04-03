import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
// import {
//   Router,
//   RouterState,
//   RouterStateSnapshot,
//   ActivatedRouteSnapshot,
// } from '@angular/router';
// import { ActivatedRoute } from '@angular/router';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

import { AuthService } from '../services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // constructor(route: ActivatedRoute) {
  //   const id: Observable<string> = route.params.pipe(map((p) => p['id']));
  //   const url: Observable<string> = route.url.pipe(
  //     map((segments) => segments.join(''))
  //   );
  //   // route.data includes both `data` and `resolve`
  //   const user = route.data.pipe(map((d) => d['user']));
  //
  //   console.log(id, url, user);
  // }

  // constructor(router: Router) {
  //   const state: RouterState = router.routerState;
  //   const snapshot: RouterStateSnapshot = state.snapshot;
  //   const root: ActivatedRouteSnapshot = snapshot.root;
  //   const child = root.firstChild;
  //   const id: Observable<string> = child?.params.map(p => p.id);
  // }

  // constructor(state: Router) {
  //   console.log(state);
  // }
  userIsAuthenticated: boolean = false;
  private authListenerSubs: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((res) => (this.userIsAuthenticated = res));
  }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }

  onSignout(): void {
    this.authService.logout();
  }
}
