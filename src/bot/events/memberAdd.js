const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * @param {import("discord.js").Client} client
 * @returns {void}
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

      const channel = guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);

      const info_channel = guild.channels.cache.get(process.env.INFO_CHANNEL_ID);

      await member
        .send({
          content: `Welcome to the SCT Coding Club, ${member.toString()}! Please verify yourself by clicking the button below.`,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('scc_verify_prompt').setLabel('Verify').setStyle(ButtonStyle.Primary)
            ),
          ],
        })
        .catch(() => {
          if (!info_channel) return;
          info_channel.send({
            content: `Welcome to the SCT Coding Club, ${member.toString()}! Please verify yourself by clicking the button below.`,
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('scc_verify_prompt').setLabel('Verify').setStyle(ButtonStyle.Primary)
              ),
            ],
          });
        });

      if (!channel) return;
      await channel.send({
        content: `Welcome to the SCT Coding Club, ${member.toString()}! `,
      });
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  });
};
