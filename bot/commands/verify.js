const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  name: 'verify',
  description: 'Verify your account with Etlab credentials',
  execute: async (interaction) => {
    const modal = new ModalBuilder()
      .setTitle('Verification')
      .setCustomId('scc_verify')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('scc_verify_username')
            .setLabel('Username')
            .setStyle(TextInputStyle.Short)
            .setMinLength(4)
            .setPlaceholder('username')
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('scc_verify_password')
            .setLabel('Password')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('password')
            .setRequired(true)
        )
      );

    interaction.showModal(modal);
  },
};
