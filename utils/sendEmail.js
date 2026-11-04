const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
   
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL, // Teri email (jass@gmail.com)
            pass: process.env.SMTP_PASSWORD // Tera Gmail ka 16-digit 'App Password'
        }
    });

  
    const mailOptions = {
        from: `Jass's App <${process.env.SMTP_EMAIL}>`,
        to: options.email,       // Kisko bhejna hai
        subject: options.subject, // Email ka Title
        text: options.message    // Asli OTP ya message
    };


    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;