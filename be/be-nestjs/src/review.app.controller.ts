import { Get, Controller, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService,
        private readonly configService: ConfigService) {

    }
    @Get()
    @Render('views')
    root() {
        return { message: 'Hello' };
    }
}