import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MailerService } from '@nestjs-modules/mailer';
import { InterviewEvent } from "./schemas/interview-event.schema";
import { Model } from "mongoose";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { google } from 'googleapis';
import ical from 'ical-generator';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(InterviewEvent.name)
    private readonly model: Model<InterviewEvent>,
    private readonly mailer: MailerService,
  ) { }

  async create(dto: CreateEventDto, hrId: string) {
    //Check for duplicate calendars
    const overlap = await this.model.exists({
      hrId,
      start: { $lt: dto.end },//start < dto.end
      end: { $gt: dto.start },//end > dto.start
    });

    if (overlap) throw new BadRequestException('Khung giờ đã được đặt');
    //save in mongoDB
    const ev = await this.model.create({ ...dto, hrId });
    await this.sendInvite(ev, false);
    return ev;
  }

  async update(eventId: string, dto: UpdateEventDto, hrId: string) {
    const ev = await this.model.findOneAndUpdate(
      { _id: eventId, hrId },//check id 
      dto,//check data update 
      { new: true },//return 
    );
    if (ev) await this.sendInvite(ev, true);//update success -> send new email 
    return ev;
  }

  private async sendInvite(
    ev: InterviewEvent,
    update = false,
  ) {

    //connect google calendar API 
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GCAL_CLIENT_ID,
      process.env.GCAL_CLIENT_SECRET,
      process.env.REDIRECT_URI,
    );

    oAuth2Client.setCredentials({ refresh_token: process.env.GCAL_REFRESH_TOKEN });
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    //create google meet 
    //create event in google calendar 
    const res = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: ev.title,
        description: ev.note,
        start: { dateTime: ev.start.toISOString(), timeZone: ev.tz },
        end: { dateTime: ev.end.toISOString(), timeZone: ev.tz },
        attendees: [{ email: ev.candidateEmail }],
        conferenceData: {
          createRequest: {
            requestId: `meet-${ev._id}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    //get google meet link 
    const entry = res.data.conferenceData?.entryPoints?.find(
      e => e.entryPointType === 'video'
    );
    const meetLink = entry?.uri;

    // Generate ICS
    const icsText = ical()
      .createEvent({
        start: ev.start,
        end: ev.end,
        summary: ev.title,
        organizer: { name: 'ITSmarHire HR', email: 'hr@itsmarthire.com' },
        attendees: [{ email: ev.candidateEmail }],
        description: ev.note,
        url: meetLink,
        location: meetLink,
      })
      .toString();

    const html = `
  <div style="font-family:sans-serif; padding:20px; background:#f5f5f5;">
    <div style="max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:8px;">
      <h2 style="margin-bottom:8px; color:#333;">Thư mời phỏng vấn</h2>
      <p>Xin chào <strong>${ev.candidateEmail.split('@')[0]}</strong>,</p>
      <p><strong>${ev.hrName}</strong> từ <strong>${ev.companyName}</strong> mời bạn tham gia buổi phỏng vấn:</p>
      <table cellpadding="8" cellspacing="0" style="width:100%; border:1px solid #ddd; border-collapse:collapse;">
      <tr>
       <td style="border:1px solid #ddd;">Tiêu đề cuộc phỏng vấn</td>
        <td style="border:1px solid #ddd;">${ev.title}</td>
     </tr>
        <tr><td style="border:1px solid #ddd;">Thời gian</td><td style="border:1px solid #ddd;">
          ${ev.start.toLocaleString()} – ${ev.end.toLocaleString()}
        </td></tr>
        ${ev.personalMessage ? `<tr>
          <td style="border:1px solid #ddd;">Lời nhắn</td>
          <td style="border:1px solid #ddd;">${ev.personalMessage}</td>
        </tr>` : ''}
      </table>
      <p style="text-align:center; margin:20px 0;">
        <a href="${meetLink}"
           style="display:inline-block;padding:12px 24px;
                  background:#1a73e8;color:#fff;text-decoration:none;
                  border-radius:4px;">
          Tham gia Meet
        </a>
      </p>
      <p>Chúc bạn một ngày tốt lành,<br/><strong>${ev.hrName}</strong> – ${ev.companyName}</p>
    </div>
  </div>
`;

    await this.mailer.sendMail({
      to: ev.candidateEmail,
      subject: update
        ? `Cập nhật lịch phỏng vấn: ${ev.title}`
        : `Thư mời phỏng vấn: ${ev.title}`,
      html,
      icalEvent: {
        filename: 'invite.ics',
        method: 'REQUEST',
        content: ical().createEvent({
          start: ev.start,
          end: ev.end,
          summary: ev.title,
          organizer: { name: ev.hrName, email: 'hr@itsmarthire.com' },
          attendees: [{ email: ev.candidateEmail }],
          description: [
            `HR: ${ev.hrName}`,
            `Công ty: ${ev.companyName}`,
            ev.personalMessage ? `Lời nhắn: ${ev.personalMessage}` : null,
            `Ghi chú: ${ev.note || '—'}`
          ].filter(Boolean).join('\n'),
          url: meetLink,
          location: meetLink,
        }).toString(),
      },
    });

    //save meetLink in DB
    ev.meetLink = meetLink;
    await ev.save();
  }

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
