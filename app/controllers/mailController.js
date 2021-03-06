// Packages
const dnsPromises = require("dns").promises;
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

// Helpers
const tokens = require ("../helpers/tokens");

exports.mail_match = async (req, res) => {
  // Get the items from the body
  const { body: { addresseeProxy, bodyParts: { html, text }, requesterProxy, subject, userId: senderId }, } = req;

  const token = await tokens.create(-99);
  const errors = [];

  const isValidStringLength = (string, name) => {
    if (string.length < 2 ) {
      errors.push({ [name]: true });
      return false;
    } else {
      return true;
    }
  };

  const isValidMessage = isValidStringLength(html, "body");
  // TODO: Also check the text when that functionality is updated...
  const isValidSubject = isValidStringLength(subject, "subject");

  if (isValidMessage && isValidSubject) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/relationships/email-address/${addresseeProxy}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const json = response.ok ? await response.json() : null;
      const { data: [{ requester: { email }, }], } = json;

      const senderResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/users/id/${senderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const senderJson = senderResponse.ok ? await senderResponse.json() : null;

      const { user: { firstName: senderFirstName, lastName: senderLastName }, } = senderJson;
      const senderLastInitial = senderLastName.slice(0,1) + ".";
      
  
      // TODO: Add something to the subject, or not
      // TODO: Filter the message
      const emailProxyStart = process.env.NODE_ENV === "development" ? "dev-buddy-" : "buddy-";
      const formData = {
        fromAddress: `"${senderFirstName} ${senderLastInitial} (VeloMatchr Buddy)" <${emailProxyStart}${requesterProxy}@velomatchr.com>`, 
        toAddress: email, 
        subject, 
        text,
        html
      }

      const sendResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/mail/relationship/send`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
  
      const sendJson = sendResponse.ok ? await sendResponse.json() : null;

      if (sendJson.status !== 200) {
        res.status(500).json(sendJson);
      } else {
        res.status(200).json({ status: 200, message: "ok" });
      }
    } catch(error) {
      res.status(500).json({ status: 500, message: "Internal Server Error", error });
    }
  } else {
    res.status(200).json({ status: 200, message: "ok", errors });
  }
};

exports.send_mail = async (req, res) => {
  const { authorized } = req;
  if (authorized) {
    const { body: { fromAddress, toAddress, subject, message }, } = req;

    const subjectPrefix = "[VELOMATCHR]";
    const subjectProcessed = subject.includes(subjectPrefix) ? subject : `${subjectPrefix} ${subject}`;

    const mailOptions = {
      from: fromAddress,
      to: toAddress,
      subject: subjectProcessed,
      html: message
    };

    const result = await transportMail(mailOptions);
    if (result.error) {
      const { error } = result;
      res.status(500).json({ status: 500, message: "Internal Server Error", error });
    } else {
      const { success } = result;
      res.status(200).json({ status: 200, data: success });
    }
  } else {
    res.sendStatus(403);
  }
};

exports.send_relationship_mail = async (req, res) => {
  const { authorized } = req;
  if (authorized) {
    const { body: { fromAddress, html, text, toAddress, subject }, } = req;

    const subjectPrefix = "[VELOMATCHR]";
    const subjectProcessed = subject.includes(subjectPrefix) ? subject : `${subjectPrefix} ${subject}`;

    const mailOptions = {
      from: fromAddress,
      to: toAddress,
      subject: subjectProcessed,
    };

    // If different message types exist, add them to mailOptions
    if (text) { mailOptions.text = text }
    if (html) { mailOptions.html = html }

    const result = await transportMail(mailOptions);
    if (result.error) {
      const { error } = result;
      res.status(500).json({ status: 500, message: "Internal Server Error", error });
    } else {
      const { success } = result;
      res.status(200).json({ status: 200, data: success });
    }
  } else {
    res.sendStatus(403);
  }
};

exports.check_mx = async (req, res) => {
  // const { authorized } = req; // TODO: update this to use API key when implemented

  // if (authorized) {
    const { email } = req.params;
  
    const mxExists = async emailAddress => {
      const hostname = emailAddress.split("@")[1];
    
      try {
        const addresses = await dnsPromises.resolveMx(hostname);

          if (addresses && addresses.length > 0) {
            return addresses[0].exchange ? true : false;
          }
      } catch (error) {
        // TODO: Deal with the error
        console.log("mailController.js ERROR:\n" + error);
        return false;
      }
    }
  
    try {
      const result = await mxExists(email);
      res.status(200).json({ status:200, message: "ok", mxExists: result});
    } catch(error) {
      console.log("mailController.js Error\n" + error);
      res.status(500).json({ status: 500, message: "Internal Server Error", mxExists: false});
    }
  // } else {
  //   res.sendStatus(403);
  // }
};

const transportMail = mailOptions => {
  return new Promise((resolve, reject) => {
    try {
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
  
      transporter.sendMail(mailOptions, (err, success) => {
        if (err) {
          resolve({ error: err });
        } else {
          resolve({ success });
        }
      });
    } catch(error) {
      reject({ error });
    }
  });
}
