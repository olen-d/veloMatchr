module.exports = (sequelize, DataTypes) => {
  const NotificationPref = sequelize.define("NotificationPref", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
          len: [1]
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    email: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
      allowNull: false
    },
    sms: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
      allowNull: false
    }
  });

 NotificationPref.associate = models => {
    NotificationPref.belongsTo(models.User, {
      as: "userNotificationPrefs",
      foreignKey: "userId"
    });
  };    

  return NotificationPref;
};
