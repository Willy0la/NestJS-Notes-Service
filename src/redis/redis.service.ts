import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { Logger } from '@nestjs/common';
@Injectable()
export class RedisService {
  private readonly redisClient: Redis;
  private readonly logger: Logger;
  constructor(config: ConfigService) {
    this.logger = new Logger(RedisService.name);
    const redisHost = config.get<string>('REDIS_HOST');
    const redisPort = config.get<number>('REDIS_PORT') || 6379;

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
    this.redisClient.on('error', (err) => {
      this.logger.log('Redis connection error', err);
    });
  }

  getClient(): Redis {
    return this.redisClient;
  }
}
