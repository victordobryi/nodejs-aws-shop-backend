import { All, Controller, Get, Param, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @All(['/:service', '/:service/*'])
  async getServiceResponse(
    @Req() request: Request,
    @Res() response: Response,
    @Param('service') service: string,
  ) {
    const result = await this.appService.getServiceResponse(service, request);

    return response.set(result.headers).status(result.status).send(result.data);
  }
}
