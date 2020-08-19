// Packages
const dnsPromises = require("dns").promises;
const nodemailer = require("nodemailer");

exports.send_mail = (req, res) => {
  const { authorized } = req;

  if (authorized) {
    const { body: { fromAddress, toAddress, subject, message }, } = req;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMPT_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  
    const mailOptions = {
      from: `${fromAddress}`,
      to: `${toAddress}`,
      subject: `[VELOMATCHR] ${subject}`,
      html: `${message}`
    };
  
    transporter.sendMail(mailOptions, (err, success) => {
      if (err) {
        res.status(500).json({ status: 500, message: `Internal server error. ${err}` });
      } else {
        res.status(200).json({ status: 200, message: "ok", data: success });
      }
    });
  } else {
    res.sendStatus(403);
  }
};

exports.check_mx = (req, res) => {
  const { authorized } = req;

  if (authorized) {
    const { email } = req.params;
  
    const mxExists = emailAddress => {
      return new Promise ((resolve, reject) => {
        const hostname = emailAddress.split("@")[1];
    
        try {
          dnsPromises.resolveMx(hostname).then(addresses => {
            if (addresses && addresses.length > 0) {
              addresses[0].exchange ? resolve(true) : resolve(false);
            }
          })
          .catch(err => {
            // TODO: Deal with the error
            console.log("mailController.js - resolveMx ERROR:\n" + err);
            resolve(false);        
          });
        } catch (err) {
          // TODO: Deal with the error
          console.log("mailController.js ERROR:\n" + err);
          reject(false);
        }
      });
    }
  
    mxExists(email).then(result => {
      res.status(200).json({ status:200, message: "ok", mxExists: result});
    })
    .catch(err => {
      // TODO: Deal with the error
      console.log("mailController.js Error\n" + err);
      res.status(403).json({ status: 500, message: "Internal Server Error", mxExists: false});
    });
  } else {
    res.sendStatus(403);
  }
};
