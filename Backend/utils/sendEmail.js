import nodemailer from 'nodemailer';

//function to send email
const sendEmail = async (options) => {
    // Create a transporter object using SMTP
    // Looking to send emails in production? Check out our Email API/SMTP product!
    const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    port: 2525,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
        }
});
 

    // Define the email options
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    // Send the email
    await transport.sendMail(mailOptions);
};

// Export the sendEmail function
export default sendEmail;