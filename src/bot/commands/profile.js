const { EmbedBuilder } = require('discord.js');
const Profile = require('../db/models/profile.model');

module.exports = {
  name: 'profile',
  description: 'View your linked university profile and connected Discord accounts',
  /**
   * @param {import("discord.js").CommandInteraction} interaction
   * @returns {Promise<void>}
   */
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    try {
      const profile = await Profile.findOne({ id: interaction.user.id });
      
      if (!profile) {
        return void (await interaction.followUp({
          content: '❌ You are not currently linked to any university profile. Use `/verify` to link your account.',
          ephemeral: true,
        }));
      }

      const allLinkedProfiles = await Profile.find({ admno: profile.admno });
      const otherAccounts = allLinkedProfiles.filter(p => p.id !== interaction.user.id);

      const embed = new EmbedBuilder()
        .setTitle('🎓 Your University Profile')
        .setDescription(`**${profile.name}**`)
        .setColor(0x0099ff)
        .setTimestamp()
        .addFields(
          { name: '🆔 Admission Number', value: profile.admno, inline: true },
          { name: '📧 Email', value: profile.email || 'Not available', inline: true },
          { name: '📚 Batch', value: profile.batch, inline: true },
          { name: '📱 Phone', value: profile.phone || 'Not available', inline: true },
          { name: '⭐ Level', value: profile.level.toString(), inline: true },
          { name: '🪙 Coins', value: profile.coins.toString(), inline: true }
        );

      if (profile.image) {
        embed.setThumbnail(profile.image);
      }

      if (otherAccounts.length > 0) {
        embed.addFields({
          name: '🔗 Other Linked Discord Accounts',
          value: `This university profile is linked to ${otherAccounts.length + 1} Discord account(s) total.\nUse \`/linked-accounts\` to see all linked accounts.`,
          inline: false
        });
      }

      embed.addFields({
        name: '📅 Linked Since',
        value: `<t:${Math.floor(profile.createdAt.getTime() / 1000)}:F>`,
        inline: false
      });

      await interaction.followUp({
        embeds: [embed],
        ephemeral: true,
      });

    } catch (error) {
      console.error('Profile view error:', error);
      await interaction.followUp({
        content: '❌ An error occurred while fetching your profile. Please try again later.',
        ephemeral: true,
      });
    }
  },
};