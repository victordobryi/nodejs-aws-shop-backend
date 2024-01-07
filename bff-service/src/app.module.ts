import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { TTL_TIME } from './constants';

@Module({
  imports: [CacheModule.register({ ttl: TTL_TIME })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
