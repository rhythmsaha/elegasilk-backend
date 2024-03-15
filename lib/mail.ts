import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    component: "mail",
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
} as nodemailer.TransportOptions);

export const sendMail = (mailOptions: nodemailer.SendMailOptions) => {
    transporter.sendMail(mailOptions, (error, info: any) => {
        if (error) {
            console.error("Error sending email: ", error);
        } else {
            console.log("Email sent: ", info.response);
        }
    });
};
