import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error: string | undefined;
    if (exception instanceof HttpException) {
      const resBody = exception.getResponse();
      if (typeof resBody === 'string') {
        message = resBody;
      } else if (resBody && typeof resBody === 'object') {
        const r = resBody as {
          message?: string | string[];
          error?: string;
        };
        message = r.message ?? exception.message;
        error = r.error;
      }
      if (status >= 400) {
        this.logger.warn(
          `[${req.method} ${req.url}] HTTP ${status}: ${typeof message === 'string' ? message : JSON.stringify(message)}`,
          exception.stack,
        );
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${req.method} ${req.url}] Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `[${req.method} ${req.url}] Unknown error type: ${typeof exception}`,
        JSON.stringify(exception),
      );
    }
    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      ...(error ? { error } : {}),
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
