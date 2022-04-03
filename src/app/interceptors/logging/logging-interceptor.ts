import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const started: number = Date.now();
    let ok: string;

    // extend server response observable with logging
    return next.handle(req).pipe(
      tap({
        // Succeeds when there is a response; ignore other events
        next: (event: HttpEvent<any>) =>
          (ok = event instanceof HttpResponse ? 'succeeded' : ''),
        // Operation failed; error is an HttpErrorResponse
        error: (error: HttpErrorResponse) => (ok = 'failed'),
      }),
      // Log when response observable either completes or errors
      finalize(() => {
        const elapsed: number = Date.now() - started;
        const msg: string = `${req.method} "${req.urlWithParams}"
             ${ok} in ${elapsed} ms.`;
        console.log(msg);
      })
    );
  }
}
