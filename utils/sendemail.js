import nodemailer from "nodemailer";



const sendEmail = async function (email, subject, message, resetpasswordURL) {
    let transporter = nodemailer.createTransport({

        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
      
        },
      });
      
      // async..await is not allowed in global scope, must use a wrapper

      
        // send mail with defined transport object
      
        const info = await transporter.sendMail({
      
          from: process.env.SMTP_FROM_EMAIL, // sender address
          to: email, // user email
          subject: subject, // Subject line
          text: "Hello world?", // plain text body
          html: message, // html body
      
        });
      
        console.log("Message sent: %s", info.messageId);
      
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
      
      
      
      main().catch(console.error);
};

export default sendEmail;
