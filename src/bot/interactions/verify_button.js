const { ModalBuilder, ActionRowBuilder, TextInputStyle, TextInputBuilder, MessageFlags } = require('discord.js');
const config = require('../config');

/**
 * @typedef {Object} VerifyButtonModule
 * @property {string} id
 * @property {Function} execute
 */

/**
 * @type {VerifyButtonModule}
 */
module.exports = {
  id: 'scc_verify_prompt',

  /**
   * @param {import("discord.js").ButtonInteraction} interaction
   * @returns {Promise<void>}
   */
  execute: async (interaction) => {
    try {
      if (interaction.member?.roles.cache.has(config.VERIFIED_ROLE_ID)) {
        return void (await interaction
          .reply({
            content: "✅ You're already verified!",
            flags: MessageFlags.Ephemeral,
          })
          .catch(console.error));
      }

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

      await interaction.showModal(modal).catch(console.error);
    } catch (error) {
      console.error('Error showing verification modal:', error);
    }
  },
};
