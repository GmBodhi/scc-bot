const { MessageFlags } = require('discord.js');
const { EtLabScraper, STATUS_CODES } = require('../../crawler');
const config = require('../config');
const Profile = require('../db/models/profile.model');

const crawler = new EtLabScraper();

/**
 * @typedef {Object} VerifyModule
 * @property {string} id
 * @property {Function} execute
 */

/**
 * @type {VerifyModule}
 */
module.exports = {
  id: 'scc_verify',

  /**
   * @param {import("discord.js").ModalSubmitInteraction} interaction
   * @returns {Promise<void>}
   */
  execute: async (interaction) => {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    if (interaction.member?.roles.cache.has(config.VERIFIED_ROLE_ID))
      return void (await interaction
        .followUp({
          content: "You're already verified!",
          ephemeral: true,
        })
        .catch(console.error));

    const username = interaction.fields.getTextInputValue('scc_verify_username');
    const password = interaction.fields.getTextInputValue('scc_verify_password');

    if (!username || !password) {
      return void (await interaction
        .followUp({
          content: 'Please provide valid username and password.',
          ephemeral: true,
        })
        .catch(console.error));
    }

    let verified = null;
    try {
      const response = await crawler.getData(username, password);

      switch (response.status) {
        case STATUS_CODES.SUCCESS:
          break;
        case STATUS_CODES.INVALID_CREDENTIALS:
          return void (await interaction
            .followUp({
              content: 'Invalid username or password. Please try again.',
              ephemeral: true,
            })
            .catch(console.error));
        case STATUS_CODES.PAGE_NOT_LOADED:
          return void (await interaction
            .followUp({
              content: 'Failed to load the page. Please try again later.',
              ephemeral: true,
            })
            .catch(console.error));
        default:
          return void (await interaction
            .followUp({
              content: 'An unknown error occurred. Please try again later.',
              ephemeral: true,
            })
            .catch(console.error));
      }

      verified = response.data;
    } catch (error) {
      console.error('Verification error:', error);
      return void (await interaction
        .followUp({
          content: 'An error occurred during verification. Please try again later.',
          ephemeral: true,
        })
        .catch(console.error));
    }

    if (!verified?.admno)
      return void (await interaction
        .followUp({
          content: ":x: You're not verified :x:\nPlease try again**",
          ephemeral: true,
        })
        .catch(console.error));

    let profile = null;
    try {
      profile = await Profile.findOneAndUpdate(
        { id: interaction.user.id },
        {
          ...verified,
          id: interaction.user.id,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Profile update error:', error);
      return void (await interaction
        .followUp({
          content: 'Database error occurred. Please try again later.',
          ephemeral: true,
        })
        .catch(console.error));
    }

    if (!profile)
      return void (await interaction
        .followUp({
          content: "Sorry, I couldn't verify you. Please try again.",
          ephemeral: true,
        })
        .catch(console.error));

    if (!interaction.member) {
      try {
        const guild = interaction.client.guilds.cache.get(config.GUILD_ID);
        if (!guild)
          return void (await interaction
            .followUp({ content: 'Something went wrong. Please try again', ephemeral: true })
            .catch(console.error));

        interaction.member = await guild.members.fetch(interaction.user.id);
        if (!interaction.member)
          return void (await interaction
            .followUp({ content: 'Something went wrong. Please try again', ephemeral: true })
            .catch(console.error));
      } catch (error) {
        console.error('Member fetch error:', error);
        return void (await interaction
          .followUp({ content: 'Something went wrong. Please try again', ephemeral: true })
          .catch(console.error));
      }
    }

    try {
      await interaction.member.roles.add(config.VERIFIED_ROLE_ID);

      await interaction
        .followUp({
          content: `You have been verified! ${verified.name} :white_check_mark:`,
          ephemeral: true,
        })
        .catch(console.error);
    } catch (error) {
      console.error('Role assignment error:', error);
      await interaction
        .followUp({
          content: "Verification successful but couldn't assign role. Please contact an admin.",
          ephemeral: true,
        })
        .catch(console.error);
    }
  },
};
