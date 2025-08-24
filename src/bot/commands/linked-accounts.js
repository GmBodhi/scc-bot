const { EmbedBuilder } = require('discord.js');
const Profile = require('../db/models/profile.model');

module.exports = {
  name: 'linked-accounts',
  description: 'View all Discord accounts linked to your university profile',
  /**
   * @param {import("discord.js").CommandInteraction} interaction
   * @returns {Promise<void>}
   */
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    try {
      const userProfile = await Profile.findOne({ id: interaction.user.id });
      
      if (!userProfile) {
        return void (await interaction.followUp({
          content: '❌ You are not currently linked to any university profile. Use `/verify` to link your account.',
          ephemeral: true,
        }));
      }

      const allLinkedProfiles = await Profile.find({ admno: userProfile.admno }).sort({ createdAt: 1 });
      
      const embed = new EmbedBuilder()
        .setTitle('🔗 Linked Discord Accounts')
        .setDescription(`**University Profile:** ${userProfile.name} (${userProfile.admno})`)
        .setColor(0x0099ff)
        .setTimestamp();

      if (userProfile.image) {
        embed.setThumbnail(userProfile.image);
      }

      let accountsList = '';
      let currentAccountIndex = -1;
      
      for (let i = 0; i < allLinkedProfiles.length; i++) {
        const profile = allLinkedProfiles[i];
        const isCurrentUser = profile.id === interaction.user.id;
        
        if (isCurrentUser) {
          currentAccountIndex = i;
        }

        try {
          const user = await interaction.client.users.fetch(profile.id);
          const linkDate = `<t:${Math.floor(profile.createdAt.getTime() / 1000)}:R>`;
          const status = isCurrentUser ? ' **(You)**' : '';
          
          accountsList += `**${i + 1}.** ${user.username}${status}\n`;
          accountsList += `   • ID: \`${profile.id}\`\n`;
          accountsList += `   • Linked: ${linkDate}\n`;
          accountsList += `   • Level: ${profile.level} | Coins: ${profile.coins}\n\n`;
        } catch (error) {
          console.error(`Error fetching user ${profile.id}:`, error);
          const status = isCurrentUser ? ' **(You)**' : '';
          const linkDate = `<t:${Math.floor(profile.createdAt.getTime() / 1000)}:R>`;
          
          accountsList += `**${i + 1}.** Unknown User${status}\n`;
          accountsList += `   • ID: \`${profile.id}\`\n`;
          accountsList += `   • Linked: ${linkDate}\n`;
          accountsList += `   • Level: ${profile.level} | Coins: ${profile.coins}\n\n`;
        }
      }

      embed.addFields({
        name: `📱 Discord Accounts (${allLinkedProfiles.length}/3)`,
        value: accountsList || 'No accounts found',
        inline: false
      });

      if (allLinkedProfiles.length > 1) {
        embed.addFields({
          name: '💡 Note',
          value: 'You can use `/unlink` to remove your Discord account from this university profile.',
          inline: false
        });
      }

      embed.setFooter({
        text: `Your account is #${currentAccountIndex + 1} in the linking order`
      });

      await interaction.followUp({
        embeds: [embed],
        ephemeral: true,
      });

    } catch (error) {
      console.error('Linked accounts view error:', error);
      await interaction.followUp({
        content: '❌ An error occurred while fetching linked accounts. Please try again later.',
        ephemeral: true,
      });
    }
  },
};