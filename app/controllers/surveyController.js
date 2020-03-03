const fetch = require("node-fetch");
const Sequelize = require("sequelize");

// Models
const { Answer, MatchPref, User } = require("../models");

const Op = Sequelize.Op;

exports.update_survey_response = (req, res) => {
  const formData = req.body;
  const userId = formData.userId;
  const errors = [];

  delete formData.userId;

  const checkSurveyAnswers = () => {
    Object.entries(formData).forEach(([key, value]) => {
      if (!value) {
        errors.push({error: "IVQ", message: "Invalid Question", key, status: 500});
      }
    });
    return errors.length > 0 ? false : true;
  }

  if (checkSurveyAnswers()) {
    const answers = Object.values(formData);

    Answer.upsert({
      userId: userId,
      answers: answers.join()
    }).then(newAnswer => {
      res.json(newAnswer);
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
  } else {
    res.json({ errors });
  }
};

exports.read_survey_response = (req, res) => {
  const userId = req.params.userid;

  Answer.findOne({
    where: {
      userId: userId
    }
  }).then(userAnswers => {
    res.json(userAnswers);
  })
  .catch(err => {
    res.status(500).json({error: err})
  });
};

exports.read_survey_response_except = (req, res) => {
  const userId = req.params.userid;

  fetch(`${process.env.REACT_APP_API_URL}/api/users/matches/preferences/${userId}`)
  .then(response => {
    return response.ok ? response.json() : new Error(response.statusText); 
  })
  .then(json => {
    const { user: { gender, latMinus, latPlus, longMinus, longPlus, userMatchPrefs: { distance, gender: matchGenderPref }, }, } = json; // Nested destructuring. Returns gender, distance and gender. Pretty dope.
    readAnswersByPrefs(gender, latMinus, latPlus, longMinus, longPlus, distance, matchGenderPref);
  })
  .catch(err => {
    // TODO: do something about the error
    console.log("surveyController.js ~56 - Error:", err);
  })

  const readAnswersByPrefs = (gender, latMinus, latPlus, longMinus, longPlus, distance, matchGenderPref) => {
    let where;
    const whereInit = {
      [Op.not]: [{userId}],
      "$matchCharacteristics.latitude$": {[Op.between]: [latMinus, latPlus]}, 
      "$matchCharacteristics.longitude$": {[Op.between]: [longMinus, longPlus]}
    };

    // Dynamically build the where clause based on preferences
    if(matchGenderPref === "any") {
      const filter = {[Op.or]: [{"$matchPrefs.gender$": "any"}, {"$matchPrefs.gender$": "same", "$matchCharacteristics.gender$": gender }]};
      where = {...whereInit, ...filter};
    } else if(matchGenderPref === "same") {
      const filter = {"$matchCharacteristics.gender$": gender };
      where = {...whereInit, ...filter};
    } else {
      where = whereInit;
    }

    Answer.findAll({
      where,
      attributes: ["userId", "answers"],
      include: [
        {
          model: User,
          as: "matchCharacteristics",
          attributes: ["gender", "latitude", "longitude"]
        },
        {
          model: MatchPref,
          as: "matchPrefs",
          attributes: ["distance", "gender"]
        }
      ]
    }).then(otherAnswers => {
      res.json(otherAnswers);
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
  }
};
