import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import {
  InterviewEvent,
  InterviewEventSchema,
} from './schemas/interview-event.schema';

@Module({
  imports: [
    // Đăng ký model với Mongoose
    MongooseModule.forFeature([
      { name: InterviewEvent.name, schema: InterviewEventSchema },
    ]),

    MailerModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule { }