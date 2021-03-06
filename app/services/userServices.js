// Models
const { User } = require("../models");

// Utilities
const logger = require("../utilities/logger");

/**
 * Create a new user in the database
 * @author Olen Daelhousen <hello@olen.dev>
 * @param {string} city - Name of the user's home city
 * @param {string} country - Name of the user's home country
 * @param {string} countryCode - ISO two letter code for the user's home country
 * @param {string} email - The user's email address
 * @param {number} emailIsVerified - 0 if the email has not been verified, 1 if the email was verified
 * @param {number} latitude - Latitude of the user's location
 * @param {number} longitude - Longitude of the user's location
 * @param {string} name - Unique user name
 * @param {string} password - Hash of the user's password
 * @param {string} postalCode - Home postal code of the user
 * @param {string} state - Home state of the user
 * @param {string} stateCode - Two letter code for the user's home state
 * @returns {Promise<object>} - The user record inserted into the database, keys are field names and values are what was inserted. Includes id, createdAt, and updatedAt in addition to the parameters
 */

exports.create_user = async (city, country, countryCode, email, emailIsVerified, latitude, longitude, name, password, postalCode, state, stateCode) => {
  try {
    const createUserResult = await User.create({
      name,
      password,
      email,
      emailIsVerified,
      latitude,
      longitude,
      city,
      state,
      stateCode,
      country,
      countryCode,
      postalCode
    });
    return createUserResult;

  } catch (error) {
    // Check for sequelize errors
    if (error.name === "SequelizeUniqueConstraintError") {
      logger.error("server.service.user.create.user.sequelize.constraint");
      throw new Error("Sequelize unique constraint error");
    } else if (error.name === "SequelizeValidationError") {
      logger.error("server.service.uses.create.user.sequelize.validation")
      throw new Error("Sequelize validation error");
    } else {
      logger.error(`server.service.user.create.user ${error}`);
      throw new Error("Could not create user.");
    }
  }
};

// Read Services

/**
 * Read user location information from the database
 * @author Olen Daelhousen <hello@olen.dev>
 * @param {string} id - User Id
 * @returns {Promise<object>} - Fields from the user record in the database including city, country, countryCode, latitude, longitude, postalCode, state, and stateCode
 */

exports.read_user_location = async id => {
  try {
    const readResult = await User.findOne({
      where: { id },
      attributes: ["city", "country", "countryCode", "latitude", "longitude", "postalCode", "state", "stateCode"]
    });
    return readResult;

  } catch (error) {
    logger.error(`server.service.user.read.user.location ${error}`);
    throw new Error(`Could not read user location information.`);
  }
};

/**
 * Read user personal information from the database
 * @author Olen Daelhousen <hello@olen.dev>
 * @param {string} id - User Id
 * @returns {Promise<object>} - Fields from the user record in the database including firstName, gender, lastName, name, and phone
 */

exports.read_user_personal_information = async id => {
  try {
    const readResult = await User.findOne({
      where: { id },
      attributes: ["firstName", "gender", "lastName", "name", "phone"]
    });
    return readResult;

  } catch (error) {
    logger.error(`server.service.user.read.user.personal.information ${error}`);
    throw new Error("Could not read user personal information.");
  }
};

/**
 * Read user personal information from the database
 * @author Olen Daelhousen <hello@olen.dev>
 * @param {string} id - User Id
 * @returns {Promise<object>} = Field from the user record in the database containing the link to the user's profile photo
 */

exports.read_user_photo_link = async id => {
  try {
    const readResult = await User.findOne({
      where: { id },
      attributes: ["photoLink"]
    });
    return readResult;

  } catch (error) {
    logger.error(`server.service.user.read.user.photo.link ${error}`);
    throw new Error("Could not read user photo link.");
  }
}

// Update Services

/**
 * Update user location in the database
 * @author Olen Daelhousen <hello@olen.dev>
 * @param {string} city - Name of the user's home city
 * @param {string} country - Name of the user's home country
 * @param {string} countryCode - ISO two letter code for the user's home country
 * @param {string} id - User Id
 * @param {number} latitude - Latitude of the user's location
 * @param {number} longitude - Longitude of the user's location
 * @param {string} postalCode - Home postal code of the user
 * @param {string} state - Home state of the user
 * @param {string} stateCode - Two letter code for the user's home state
 * @returns {Promise<array>} - The number of records updated. 0 if no update occurred and 1 if the update was successful. 
 */

exports.update_user_location_all = async (city, country, countryCode, id, latitude, longitude, postalCode, state, stateCode) => {
  try {
    const updateResult = await User.update(
      {
        latitude,
        longitude,
        city,
        state,
        stateCode,
        country,
        countryCode,
        postalCode
      },
      { where: { id } }
    );
    return updateResult;

  } catch (error) {
    // Check for sequelize errors
    if (error.name === "SequelizeUniqueConstraintError") {
      logger.error("server.service.user.update.user.location.all.sequelize.constraint");
      throw new Error("Sequelize unique constraint error");
    } else if (error.name === "SequelizeValidationError") {
      logger.error("server.service.user.update.user.location.all.sequelize.validation")
      throw new Error("Sequelize validation error");
    } else {
      logger.error(`server.service.user.update.user.location.all ${error}`);
      throw new Error("Could not update user location.");
    }
  }
};


/**
 * Update user personal information in the database
 * @author Olen Daelhousen <hello@olen.dev>
 * @param {string} firstName - First name of the user
 * @param {string} gender - Gender of the user
 * @param {string} id - User Id
 * @param {string} lastName - Last name of the user
 * @param {string} name - Unique user name
 * @param {string} phone - Phone number of the user
 * @returns {Promise<array>} - The number of records updated. 0 if no update occurred and 1 if the update was successful. 
 */

exports.update_user_personal_information = async (firstName, gender, id, lastName, name, phone) => {
  try {
    const updateResult = await User.update(
      {
        name,
        firstName,
        lastName,
        phone,
        gender
      },
      { where: { id } }
    );
    return updateResult;

  } catch (error) {
    // Check for sequelize errors
    if (error.name === "SequelizeUniqueConstraintError") {
      logger.error("server.service.user.update.user.personal.information.sequelize.constraint");
      throw new Error("Sequelize unique constraint error");
    } else if (error.name === "SequelizeValidationError") {
      logger.error("server.service.user.update.user.personal.information.sequelize.validation")
      throw new Error("Sequelize validation error");
    } else {
      logger.error(`server.service.user.update.user.personal.information ${error}`);
      throw new Error("Could not update personal information for the user.");
    }
  }
}
