const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * @type {string}
 */
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

/**
 * @type {string}
 */
const INFO_CHANNEL_ID = process.env.INFO_CHANNEL_ID;

/**
 * @param {import("discord.js").Client} client
 */
module.exports = (client) => {
  /**
   * @param {import("discord.js").GuildMember} member
   */
  client.on('guildMemberAdd', async (member) => {
    try {
      if (!member.guild) return;
      if (member.user.bot) return;

      const guild = member.guild;
      const channel = guild.channels.cache.get(WELCOME_CHANNEL_ID);
      const info_channel = guild.channels.cache.get(INFO_CHANNEL_ID);

      const verifyButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('scc_verify_prompt').setLabel('Verify').setStyle(ButtonStyle.Primary)
      );

      try {
        await member.send({
          content: `Welcome to the SCT Coding Club, ${member.toString()}! Please verify yourself by clicking the button below.`,
          components: [verifyButton],
        }).catch((error) => console.error('Error sending DM:', error));
      } catch (_error) {
        console.error('Error sending DM to member:', _error);
        if (info_channel) {
          const msg = await info_channel
            .send({
              content: `Welcome to the SCT Coding Club, ${member.toString()}! Please verify yourself by clicking the button below.`,
              components: [verifyButton],
            })
            .catch((error) => console.error('Error sending info channel message:', error));

          setTimeout(() => {
            msg.delete().catch((error) => console.error('Error deleting info channel message:', error));
          }, 1000 * 60 * 10); 
        }
      }

      if (channel) {
        await channel
          .send({
            content: `Welcome to the SCT Coding Club, ${member.toString()}! `,
          })
          .catch((error) => console.error('Error sending welcome channel message:', error));
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  });
};
