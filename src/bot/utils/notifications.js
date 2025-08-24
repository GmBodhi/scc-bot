const { EmbedBuilder } = require('discord.js');

/**
 * Sends DM notifications to all existing linked Discord accounts when a new account links
 * @param {import('discord.js').Client} client - Discord client
 * @param {Array} existingProfiles - Array of existing Profile documents
 * @param {Object} newAccountInfo - Information about the newly linked account
 * @param {string} newAccountInfo.userId - Discord ID of new account
 * @param {string} newAccountInfo.username - Discord username of new account
 * @param {Object} universityProfile - University profile information
 * @param {string} universityProfile.name - Student name
 * @param {string} universityProfile.admno - Admission number
 */
async function notifyExistingAccounts(client, existingProfiles, newAccountInfo, universityProfile) {
  if (!existingProfiles || existingProfiles.length === 0) {
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('🔗 New Account Linked')
    .setDescription(`A new Discord account has been linked to your university profile.`)
    .setColor(0xffa500)
    .setTimestamp()
    .addFields(
      { name: '🎓 University Profile', value: `**${universityProfile.name}**\nAdmission No: ${universityProfile.admno}`, inline: false },
      { name: '👤 New Discord Account', value: `**${newAccountInfo.username}**\nID: \`${newAccountInfo.userId}\``, inline: false },
      { name: '📊 Total Linked Accounts', value: `${existingProfiles.length + 1}/3 accounts`, inline: true },
      { name: '🛡️ Security Notice', value: 'If this was not you, please contact a server administrator immediately.', inline: false }
    )
    .setFooter({
      text: 'Use /linked-accounts to see all connected accounts • Use /unlink to remove your account'
    });

  const notificationPromises = existingProfiles.map(async (profile) => {
    try {
      const user = await client.users.fetch(profile.id);
      
      const personalizedEmbed = EmbedBuilder.from(embed)
        .setDescription(`A new Discord account has been linked to your university profile: **${universityProfile.name}**`)
        .addFields(
          { name: '📅 Your Account Linked', value: `<t:${Math.floor(profile.createdAt.getTime() / 1000)}:R>`, inline: true }
        );

      await user.send({ embeds: [personalizedEmbed] });
      console.log(`Notification sent to user ${profile.id} (${user.username})`);
      
    } catch (error) {
      console.error(`Failed to send notification to user ${profile.id}:`, error.message);
      // Don't throw error - continue with other notifications
    }
  });

  try {
    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error('Error in notification process:', error);
  }
}

/**
 * Sends DM notification when an account is unlinked
 * @param {import('discord.js').Client} client - Discord client
 * @param {Array} remainingProfiles - Array of remaining Profile documents
 * @param {Object} unlinkedAccountInfo - Information about the unlinked account
 * @param {Object} universityProfile - University profile information
 */
async function notifyAccountUnlinked(client, remainingProfiles, unlinkedAccountInfo, universityProfile) {
  if (!remainingProfiles || remainingProfiles.length === 0) {
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('🔓 Account Unlinked')
    .setDescription(`A Discord account has been unlinked from your university profile.`)
    .setColor(0xff4444)
    .setTimestamp()
    .addFields(
      { name: '🎓 University Profile', value: `**${universityProfile.name}**\nAdmission No: ${universityProfile.admno}`, inline: false },
      { name: '👤 Unlinked Discord Account', value: `**${unlinkedAccountInfo.username}**\nID: \`${unlinkedAccountInfo.userId}\``, inline: false },
      { name: '📊 Remaining Linked Accounts', value: `${remainingProfiles.length}/3 accounts`, inline: true },
      { name: '🛡️ Security Notice', value: 'If this was not authorized by you, please contact a server administrator immediately.', inline: false }
    )
    .setFooter({
      text: 'Use /linked-accounts to see all connected accounts'
    });

  const notificationPromises = remainingProfiles.map(async (profile) => {
    try {
      const user = await client.users.fetch(profile.id);
      
      await user.send({ embeds: [embed] });
      console.log(`Unlink notification sent to user ${profile.id} (${user.username})`);
      
    } catch (error) {
      console.error(`Failed to send unlink notification to user ${profile.id}:`, error.message);
    }
  });

  try {
    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error('Error in unlink notification process:', error);
  }
}

module.exports = {
  notifyExistingAccounts,
  notifyAccountUnlinked,
};