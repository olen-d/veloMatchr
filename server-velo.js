require("dotenv").config();

const express = require("express");
const app = express();
const matchMail = require("./app/utilities/match-mail");
const logger = require("./app/utilities/logger");

const port =  process.env.PORT || 5000;

// Comment out when syncing not needed.
const db = require("./app/models");

if (process.env.NODE_ENV === "development") {
  const cors = require("cors");
  app.use(cors());
}

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json({limit: "5mb"}));

// Set up the static folder for the profile images
app.use("/public/images-profiles", express.static("public/images-profiles"));

// Set up the routes
// const apiRoutes = require("./app/routing/apiRoutes")(app);
// const htmlRoutes = require("./app/routing/htmlRoutes")(app);
app.use("/api", require("./app/routes/auth"));
app.use("/api", require("./app/routes/countries"));
app.use("/api", require("./app/routes/mail"));
app.use("/api", require("./app/routes/matches"));
app.use("/api", require("./app/routes/notifications"));
app.use("/api", require("./app/routes/relationships"));
app.use("/api", require("./app/routes/states"));
app.use("/api", require("./app/routes/survey"));
app.use("/api", require("./app/routes/users"));

// Perform inital check of the buddy mailbox
// After starting, matchMail will automatically listen for and process new emails
(async () => {
  try {
    // Check for new emails since the server was last started and proceess them
    const newEmails = await matchMail.getNewMail();

    if (newEmails.length > 0) {
      matchMail.processMail(newEmails);
    }
  } catch(error) {
    // TODO: deal with the error
    const { message } = error;

    if (message === "Could not connect to IMAP server.") {
      logger.error(`server.mailbox ${message} Email forwarding is disabled.`);
    } else {
      logger.error(`server.mailbox ${error}`);
    }
  }
})();

// db.sequelize.sync({ force: true }).then(function() {
  // db.sequelize.sync({ alter: true }).then(function() {
  db.sequelize.sync().then(function() {
    app.listen(port, () => logger.info(`VeloMatchr API is listening on port ${port}!`));
  });
// });

// app.listen(port, () => logger.info(`VeloMatchr API is listening on port ${port}!`));
