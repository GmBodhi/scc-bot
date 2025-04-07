const { ModalBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const { TextInputBuilder } = require('discord.js');

module.exports = {
  id: 'scc_verify_prompt',
  /**
   * @param {import("discord.js").ButtonInteraction} interaction
   * @returns {Promise<void>}
   */
  execute: async (/** @type {import("discord.js").ButtonInteraction} */ interaction) => {
    const modal = new ModalBuilder()
      .setTitle('Etlab Verification')
      .setCustomId('scc_verify')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('scc_verify_username')
            .setLabel('Etlab Username')
            .setStyle(TextInputStyle.Short)
            .setMinLength(4)
            .setPlaceholder('username')
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('scc_verify_password')
            .setLabel('Etlab Password')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('password')
            .setRequired(true)
        )
      );

    interaction.showModal(modal);

    //
  },
};
