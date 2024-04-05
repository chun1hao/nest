import {
  Post,
  Body,
  Controller,
  Get,
  Inject,
  Query,
  UnauthorizedException,
  DefaultValuePipe,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { UserInfoVo } from './vo/userinfo.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateParseIntPipe } from 'src/utils';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/my-file-storage';

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  constructor(private readonly userService: UserService) {}

  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  @Post('register')
  async register(@Body() registerInfo: RegisterDto) {
    return await this.userService.register(registerInfo);
  }

  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xxx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('emailcode')
  async getEmailCode(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendEmail({
      to: address,
      subject: '会议预定系统',
      html: `<p>你的注册验证码是 ${code}</p>`,
    });

    return '发送成功';
  }

  @Post('login')
  async login(@Body() userInfo: LoginDto) {
    const vo = await this.userService.login(userInfo);

    const { access_token, refresh_token } = this.genToken(vo.userInfo);
    vo.accessToken = access_token;

    vo.refreshToken = refresh_token;

    return vo;
  }

  @Post('admin/login')
  async adminLogin(@Body() userInfo: LoginDto) {
    const vo = await this.userService.login(userInfo, true);

    const { access_token, refresh_token } = this.genToken(vo.userInfo);
    vo.accessToken = access_token;

    vo.refreshToken = refresh_token;

    return vo;
  }

  @Get('refreshtoekn')
  async refreshtoekn(@Query('token') token: string) {
    try {
      const data = this.jwtService.verify(token);
      const user = await this.userService.findUserById(data.id, false);

      return this.genToken(user);
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, true);

      return this.genToken(user);
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get('info')
  @RequireLogin()
  async update_password(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);
    const vo = new UserInfoVo();
    vo.id = user.id;
    vo.email = user.email;
    vo.username = user.username;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.nickName = user.nickName;
    vo.createTime = user.createTime;
    vo.isFrozen = user.isFrozen;

    return vo;
  }

  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(passwordDto);
  }

  @Get('update_password/captcha')
  async getCaptchaCode(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      10 * 60,
    );

    await this.emailService.sendEmail({
      to: address,
      subject: '更改密码验证码',
      html: `<p>更改密码验证码是 ${code}</p>`,
    });

    return '发送成功';
  }

  @Post(['update', 'admin/update'])
  @RequireLogin()
  async updateUser(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  @Get('update/captcha')
  @RequireLogin()
  async updateCaptcha(@UserInfo('email') email: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`update_user_captcha_${email}`, code, 10 * 60);
    await this.emailService.sendEmail({
      to: email,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是：${code}</p>`,
    });
  }

  @Get('freeze')
  async freeze(@UserInfo('userId') userId: number) {
    await this.userService.freeze(userId);
    return 'success';
  }

  @Get('list')
  async userList(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ) {
    return await this.userService.findUsersByPage(
      pageNo,
      pageSize,
      username,
      nickName,
      email,
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      fileFilter(req, file, callback) {
        // 限制只能上传图片
        const extname = path.extname(file.originalname);
        if (['.png', '.jpg', '.gif'].includes(extname)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('只能上传图片'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return file.path;
  }

  @Get('initdata')
  async initdata() {
    await this.userService.initData();
    return 'success';
  }

  genToken(user) {
    const access_token = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
        email: user.email,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );
    return {
      access_token,
      refresh_token,
    };
  }
}
