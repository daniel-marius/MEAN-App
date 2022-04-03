import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { map, shareReplay, catchError, startWith, mapTo } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';

import { Post } from '../../models';
import { PostsService } from '../../services';
import { AuthService } from '../../services';
import { ContentState } from '../../shared/utilities';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  totalPosts: number = 0;
  postsPerPage: number = 2;
  currentPage: number = 1;
  pageSizeOptions: Array<number> = [1, 2, 5, 10];
  userIsAuthenticated: boolean = false;
  userId: string | null = null;
  posts: Array<Post> = [];

  private postsSub: Subscription = new Subscription();
  private authStatusSub: Subscription = new Subscription();

  readonly ContentState: typeof ContentState = ContentState;
  readonly getAllPosts$: Observable<{
    state: ContentState;
    item?: any;
    error?: any;
  }> = this.postsService.getAllPosts(this.postsPerPage, this.currentPage).pipe(
    map((item) => ({ state: ContentState.LOADED, item })),
    startWith({ state: ContentState.LOADING }),
    catchError((e) => of({ state: ContentState.ERROR, error: e.message }))
  );

  posts$: Observable<any> = this.postsService
    .getMyPosts(this.postsPerPage, this.currentPage)
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  isLoading$ = this.posts$.pipe(mapTo(false), startWith(true));
  error$ = this.posts$.pipe(
    mapTo(false),
    catchError((e) => of(e))
  );

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsService.refresh$.subscribe(() => {
      this.posts$ = this.postsService
        .getMyPosts(this.postsPerPage, this.currentPage)
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));
      this.isLoading$ = this.posts$.pipe(mapTo(false), startWith(true));
      this.error$ = this.posts$.pipe(
        mapTo(false),
        catchError((e) => of(e))
      );
    });
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((res) => {
        this.userIsAuthenticated = res;
        this.userId = this.authService.getUserId();
      });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onDelete(id: string | undefined | null): void {
    this.isLoading = true;
    this.postsService.deletePost(id).subscribe({
      next: () => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onChangePage(pageData: PageEvent): void {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }
}
