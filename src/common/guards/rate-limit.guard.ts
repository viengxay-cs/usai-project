import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface Entry { count: number; resetAt: number }

@Injectable()
export class SimpleRateLimitGuard implements CanActivate {
  protected readonly windowMs: number = 60_000;
  protected readonly maxRequests: number = 30;
  private readonly store = new Map<string, Entry>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ ip?: string; path?: string }>();
    const key = `${request.ip ?? 'unknown'}:${request.path ?? 'unknown'}`;
    const now = Date.now();
    const current = this.store.get(key);

    if (!current || current.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    current.count += 1;
    if (current.count > this.maxRequests) {
      throw new HttpException(
  'Too many requests. Please try again later.',
  HttpStatus.TOO_MANY_REQUESTS,
);
    }
    return true;
  }
}
