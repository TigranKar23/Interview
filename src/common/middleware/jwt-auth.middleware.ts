import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthTokensGenerator } from '../helpers/utils/AuthTokensGenerator';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private readonly authTokensGenerator: AuthTokensGenerator,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("Unauthorized");
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const decoded: any = this.authTokensGenerator.verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.validateUser(decoded.user_id, request);
  }

  private async validateUser(userId: string, request: any): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: 99,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    request.identity = user;
    return true;
  }
}
