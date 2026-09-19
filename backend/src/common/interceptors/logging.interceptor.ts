import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const start = Date.now();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        console.log(`[${method}] ${url} - ${duration}ms`);
      }),
    );
  }
}
