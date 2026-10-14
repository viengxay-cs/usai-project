import { Injectable } from '@nestjs/common';
import { SimpleRateLimitGuard } from './rate-limit.guard';

@Injectable()
export class AuthRateLimitGuard extends SimpleRateLimitGuard {
  protected override readonly windowMs = 60_000;
  protected override readonly maxRequests = 10;
}
