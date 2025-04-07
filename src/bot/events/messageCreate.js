const Profile = require('../db/models/profile.model');

/**
 * @param {import('discord.js').Client} client
 */
module.exports = (client) => {
  const cooldowns = new Map();
  const COOLDOWN_TIME = 60000; // 1 minute
  const XP_PER_MESSAGE = 1;

  const LEVEL_THRESHOLDS = {
    2: 20,
    3: 100,
    4: 500,
    5: 2000,
  };

  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.member) return;

    const userId = message.author.id;

    if (cooldowns.has(userId)) {
      const timeLeft = cooldowns.get(userId) - Date.now();
      if (timeLeft > 0) return;
    }

    try {
      cooldowns.set(userId, Date.now() + COOLDOWN_TIME);

      let userProfile = await Profile.findOne({ id: userId });
      if (!userProfile)
        return message.member.send('You do not have a profile yet. Please use the /verify to create one.');

      const currentLevel = userProfile.level;

      userProfile.xp += XP_PER_MESSAGE;

      for (let level = currentLevel + 1; level <= 5; level++) {
        if (userProfile.xp >= LEVEL_THRESHOLDS[level]) {
          userProfile.level = level;
          message.channel.send(`🎉 Congratulations ${message.author}! You've reached level ${level}!`);
        } else {
          break;
        }
      }

      await userProfile.save();
    } catch (error) {
      console.error('Error in messageCreate XP system:', error);
    }
  });
};
