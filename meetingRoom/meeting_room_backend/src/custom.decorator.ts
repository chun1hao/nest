import {
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

export const RequireLogin = () => SetMetadata('require-login', true);

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('require-permission', permissions);

// 获取当前req信息，传入属性名返回对应值，否则返回整体信息
export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) {
      return null;
    }
    return data ? request.user[data] : request.user;
  },
);
