const { EmbedBuilder } = require('discord.js');
const Profile = require('../db/models/profile.model');
const config = require('../config');
const { notifyAccountUnlinked } = require('../utils/notifications');

module.exports = {
  name: 'unlink',
  description: 'Unlink your Discord account from your university profile',
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
          content: '❌ You are not currently linked to any university profile.',
          ephemeral: true,
        }));
      }

      const linkedProfiles = await Profile.find({ admno: profile.admno });
      const otherLinkedAccounts = linkedProfiles.filter(p => p.id !== interaction.user.id);

      await Profile.deleteOne({ id: interaction.user.id });

      if (interaction.member?.roles.cache.has(config.VERIFIED_ROLE_ID)) {
        try {
          await interaction.member.roles.remove(config.VERIFIED_ROLE_ID);
        } catch (error) {
          console.error('Error removing verified role:', error);
        }
      }

      if (otherLinkedAccounts.length > 0) {
        try {
          const unlinkedUser = await interaction.client.users.fetch(interaction.user.id);
          await notifyAccountUnlinked(
            interaction.client,
            otherLinkedAccounts,
            {
              userId: interaction.user.id,
              username: unlinkedUser.username,
            },
            {
              name: profile.name,
              admno: profile.admno,
            }
          );
        } catch (error) {
          console.error('Error sending unlink notifications:', error);
        }
      }

      const embed = new EmbedBuilder()
        .setTitle('✅ Successfully Unlinked')
        .setDescription(`Your Discord account has been unlinked from university profile: **${profile.name}** (${profile.admno})`)
        .setColor(0x00ff00)
        .setTimestamp();

      if (otherLinkedAccounts.length > 0) {
        embed.addFields({
          name: '📌 Note',
          value: `This university profile is still linked to ${otherLinkedAccounts.length} other Discord account(s).\nOther users can still access this university profile through their linked accounts.`,
          inline: false
        });
      } else {
        embed.addFields({
          name: '📌 Note',
          value: 'This university profile is no longer linked to any Discord accounts.',
          inline: false
        });
      }

      await interaction.followUp({
        embeds: [embed],
        ephemeral: true,
      });

    } catch (error) {
      console.error('Unlink error:', error);
      await interaction.followUp({
        content: '❌ An error occurred while unlinking your account. Please try again later.',
        ephemeral: true,
      });
    }
  },
};