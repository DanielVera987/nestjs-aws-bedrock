import { Body, Controller, Post } from '@nestjs/common';
import { BedRockService } from './bedrock.service';
import type ChatRequestDTO from './dto/ChatRequestDTO';

@Controller()
export class AppController {
  constructor(private readonly appService: BedRockService) {}

  @Post()
  chat(@Body() body: ChatRequestDTO): Promise<Record<string, unknown>> {
    return this.appService.invokeModel(body.question);
  }
}
