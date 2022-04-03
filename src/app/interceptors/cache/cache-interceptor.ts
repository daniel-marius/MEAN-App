import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  private cache: Map<string, any> = new Map<string, any>();

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {
      return next.handle(request);
    }
    const cachedResponse: any = this.cache.get(request.url);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle(request).pipe(
      tap((response: HttpEvent<any>) => {
        console.log(response);
        if (response instanceof HttpResponse) {
          this.cache.set(request.url, response);
        }
      })
    );
  }
}
