import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MailerService } from '@nestjs-modules/mailer';
import { InterviewEvent } from "./schemas/interview-event.schema";
import { Model } from "mongoose";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import ical from 'ical-generator';

// events.service.ts
@Injectable()
export class EventsService {
  constructor(
    @InjectModel(InterviewEvent.name)
    private readonly model: Model<InterviewEvent>,
    private readonly mailer: MailerService,
  ) { }

  /** tạo & gửi thư mời */
  async create(dto: CreateEventDto, hrId: string) {
    // 1. Chặn trùng
    const overlap = await this.model.exists({
      hrId,
      start: { $lt: dto.end },
      end: { $gt: dto.start },
    });

    if (overlap) throw new BadRequestException('Khung giờ đã được đặt');
    const toCreate = { ...dto, hrId };
    console.log('Creating event:', toCreate);
    const ev = await this.model.create({ ...dto, hrId });
    await this.sendInvite(ev, false);
    return ev;
  }

  async update(eventId: string, dto: UpdateEventDto, hrId: string) {
    const ev = await this.model.findOneAndUpdate(
      { _id: eventId, hrId },
      dto,
      { new: true },
    );
    if (ev) await this.sendInvite(ev, true);
    return ev;
  }

  private async sendInvite(
    ev: InterviewEvent,
    update = false,
  ) {
    const icsText = ical()
      .createEvent({
        start: ev.start,
        end: ev.end,
        summary: ev.title,
        organizer: { name: 'ITSmarHire HR', email: 'hr@itsmarthire.com' },
        attendees: [{ email: ev.candidateEmail }],
        description: ev.note,
        url: ev.meetLink,
        location: ev.meetLink,
      })
      .toString();

    await this.mailer.sendMail({
      to: ev.candidateEmail,
      subject: update
        ? `Cập nhật lịch phỏng vấn: ${ev.title}`
        : `Thư mời phỏng vấn: ${ev.title}`,
      html: `<p>Xin chào,<br/>Bạn có lịch phỏng vấn <b>${ev.title}</b> vào ${ev.start.toLocaleString()}.</p>`,
      icalEvent: {
        filename: 'invite.ics',
        method: 'REQUEST',
        content: icsText,
      },
    });
  }

  // ------------------------------------------------------------------
  /** phần còn lại giữ nguyên */
  findRange(hrId: string, start: Date, end: Date) {
    return this.model.find({ hrId, start: { $lt: end }, end: { $gt: start } });
  }
  findOne(id: string) {
    return this.model.findById(id);
  }
  remove(id: string, hrId: string) {
    return this.model.findOneAndDelete({ _id: id, hrId });
  }
}
