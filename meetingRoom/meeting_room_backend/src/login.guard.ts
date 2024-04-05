import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Permission } from './user/entities/permission.entity';
import { Reflector } from '@nestjs/core';
import { UnLoginException } from './unlogin.filter';

interface JwtUserData {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  permissions: Permission[];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!requireLogin) {
      return true;
    }

    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnLoginException('用户未登录');
    }

    try {
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify<JwtUserData>(token);

      req.user = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        roles: data.roles,
        permissions: data.permissions,
      };

      return true;
    } catch (e) {
      throw new UnauthorizedException('权限已过期');
    }
  }
}
