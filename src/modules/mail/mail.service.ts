import nodemailer, { Transporter } from "nodemailer";
import { SendMailOptions } from "./mail.types";

class MailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST as string,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER as string,
                pass: process.env.SMTP_PASS as string,
            },
        });
    }

    async sendMail(options: SendMailOptions): Promise<void> {
        await this.transporter.sendMail({
            from: process.env.MAIL_FROM as string,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
    }
}

export const mailService = new MailService();