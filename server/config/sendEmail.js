import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async (mailOptions) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  });

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;