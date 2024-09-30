import { BadRequestException, Injectable } from '@nestjs/common';
import { default as sgMail } from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private mailFrom: string;
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
    this.mailFrom = this.configService.get('MAIL_FROM');
  }
  public async sendMail(email: string, filename: string, url: string) {
    try {
      const subject = `Access to ${filename}`;

      await sgMail.send({
        from: this.mailFrom,
        to: email,
        subject,
        text: url,
      });
    } catch (e) {
      console.log(e.response?.body);
      throw new BadRequestException(
        'Email sending error. Please try again later',
      );
    }
  }
}
