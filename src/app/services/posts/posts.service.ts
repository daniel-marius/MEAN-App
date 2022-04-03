import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, BehaviorSubject } from 'rxjs';
import { map, shareReplay, catchError, startWith, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { Post } from '../../models';
import { ContentState } from '../../shared/utilities';

const BASE_URL = `${environment.apiUrl}/posts`;

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  readonly ContentState: typeof ContentState = ContentState;
  private posts: Array<Post> = [];
  private postsUpdated: Subject<{
    posts: Array<Post>;
    postCount: number;
  }> = new Subject<{ posts: Array<Post>; postCount: number }>();
  private _refresh$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );
  refresh$: Observable<boolean> = this._refresh$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        `${BASE_URL}` + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post: any) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            maxPosts: postData.maxPosts,
          };
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPosts.maxPosts,
        });
      });
  }

  getAllPosts(
    postsPerPage: number,
    currentPage: number
  ): Observable<{ state: ContentState; item?: any; error?: any }> {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    return this.http
      .get<{ state: ContentState; item?: any; error?: any }>(
        `${BASE_URL}` + queryParams
      )
      .pipe(
        map((item) => ({ state: ContentState.LOADED, item })),
        startWith({ state: ContentState.LOADING }),
        catchError((e) => of({ state: ContentState.ERROR, error: e.message })),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  getMyPosts(
    postsPerPage: number,
    currentPage: number
  ): Observable<{ message: string; posts: any; maxPosts: number }> {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    return this.http.get<{ message: string; posts: any; maxPosts: number }>(
      `${BASE_URL}` + queryParams
    ).pipe(tap(() => { this._refresh$.next(true); }));;
  }

  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(`${BASE_URL}`, postData)
      .pipe(
        tap(() => {
          this._refresh$.next(true);
        })
      )
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    image: File | string
  ): void {
    let postData: FormData | Post;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null,
      };
    }
    this.http.put(`${BASE_URL}/${id}`, postData).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  deletePost(id: string | undefined | null): Observable<Object> {
    return this.http.delete(`${BASE_URL}/${id}`);
  }

  getPostUpdateListener(): Observable<{
    posts: Array<Post>;
    postCount: number;
  }> {
    return this.postsUpdated.asObservable();
  }

  getPost(
    id: string | null
  ): Observable<{
    _id: string;
    title: string;
    content: string;
    imagePath: string;
    creator: string;
  }> {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(`${BASE_URL}/${id}`);
  }
}
