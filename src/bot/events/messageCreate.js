const Profile = require('../db/models/profile.model');

/**
 * @type {Map<string, number>}
 */
const cooldowns = new Map();

const COOLDOWN_TIME = 60000;

const XP_PER_MESSAGE = 1;

const LEVEL_THRESHOLDS = {
  2: 20,
  3: 100,
  4: 500,
  5: 2000,
};

/**
 * @param {import('discord.js').Client} client
 */
module.exports = (client) => {
  /**
   * @param {import('discord.js').Message} message
   */
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
      if (!userProfile) {
        await message.member.send('You do not have a profile yet. Please use the /verify to create one.')
          .catch(error => console.error('Error sending DM:', error));
        return;
      }

      const currentLevel = userProfile.level;
      userProfile.xp += XP_PER_MESSAGE;

      for (let level = currentLevel + 1; level <= 5; level++) {
        if (userProfile.xp >= LEVEL_THRESHOLDS[level]) {
          userProfile.level = level;
          await message.channel.send(`🎉 Congratulations ${message.author}! You've reached level ${level}!`)
            .catch(error => console.error('Error sending level up message:', error));
        } else {
          break;
        }
      }

      try {
        await userProfile.save();
      } catch (saveError) {
        console.error('Error saving user profile:', saveError);
      }
    } catch (error) {
      console.error('Error in messageCreate XP system:', error);
    }
  });
};
