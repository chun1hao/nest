import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const reponse = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data) => {
        return {
          code: reponse.statusCode,
          data,
          message: 'success',
        };
      }),
    );
  }
}
