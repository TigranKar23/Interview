import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { TokensInterface } from '../../../interfaces/TokensInterface';

@Injectable()
export class AuthTokensGenerator {
  getPrivateKey(): string {
    return fs.readFileSync(process.env.AUTH_PRIVATE_KEY_PATH, 'utf8');
  }

  getPublicKey(): string {
    return fs.readFileSync(process.env.AUTH_PUBLIC_KEY_PATH, 'utf8');
  }

  generateTokens(user: User, remember?: boolean): TokensInterface {
    const payload = { user_id: user.id, email: user.email };
    const privateKey: string = this.getPrivateKey();
    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: remember ? '30d' : '2h',
    });

    const refreshToken: string = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: remember ? '60d' : '5d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  verifyToken(token: string) {
    try {
      const publicKey: string = this.getPublicKey();
      return jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
      });
    } catch (e) {
      return null;
    }
  }
}
