import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BedRockService } from './bedrock.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [BedRockService],
})
export class AppModule {}
