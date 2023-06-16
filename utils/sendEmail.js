const nodemailer = require("nodemailer");

const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const options = {
    from: sent_from,
    to: send_to,
    subject: subject,
    html: message,
    replyTo: reply_to,
  };

  // send mail with defined transport object
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    }
    console.log(info);
  });
};

module.exports = sendEmail;
