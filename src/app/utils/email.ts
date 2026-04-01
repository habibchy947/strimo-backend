import nodemailer from "nodemailer"
import { envVars } from "../../config/env";
import { SendEmailOptions } from "../interfaces/emailSender.interface";
import path from "path";
import ejs from "ejs";
import AppError from "../errorHelper/AppError";
import status from "http-status";

const transPorter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS,
    },
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
});

export const sendEmail = async ({ to, subject, templateName, templateData, attachments }: SendEmailOptions) => {
    try {
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData);
        const info = await transPorter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        })
        console.log(`Email sent to ${to} : ${info.messageId}`)
    } catch (error: any) {
        console.log("Email sending error:", error.message);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email!");
    };
};