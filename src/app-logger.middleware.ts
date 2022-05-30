import {Injectable, Logger, NestMiddleware} from '@nestjs/common';
import {response} from "express";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  use(req: any, res: any, next: () => void) {
    const {ip, method, originalUrl} = req;
    res.on('close', () =>{
      const {statusCode} = res;
      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${ip}`);
    });
    next();
  }
}
