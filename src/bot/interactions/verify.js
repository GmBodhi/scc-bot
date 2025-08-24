const { MessageFlags } = require('discord.js');
const { EtLabScraper, STATUS_CODES } = require('../../crawler');
const config = require('../config');
const Profile = require('../db/models/profile.model');
const { notifyExistingAccounts } = require('../utils/notifications');

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
      const existingProfile = await Profile.findOne({ id: interaction.user.id });
      
      if (existingProfile) {
        if (existingProfile.admno === verified.admno) {
          profile = await Profile.findOneAndUpdate(
            { id: interaction.user.id },
            { ...verified, id: interaction.user.id },
            { new: true }
          );
        } else {
          return void (await interaction
            .followUp({
              content: `❌ Your Discord account is already linked to a different university profile (${existingProfile.admno}). Use \`/unlink\` first to unlink your current profile.`,
              ephemeral: true,
            })
            .catch(console.error));
        }
      } else {
        const existingAdmnoProfiles = await Profile.find({ admno: verified.admno });
        
        if (existingAdmnoProfiles.length >= 3) {
          return void (await interaction
            .followUp({
              content: `❌ Maximum number of Discord accounts (3) already linked to this university profile (${verified.admno}). Contact an admin if you need assistance.`,
              ephemeral: true,
            })
            .catch(console.error));
        }
        
        profile = new Profile({
          ...verified,
          id: interaction.user.id,
        });
        await profile.save();

        if (existingAdmnoProfiles.length > 0) {
          try {
            const newUser = await interaction.client.users.fetch(interaction.user.id);
            await notifyExistingAccounts(
              interaction.client,
              existingAdmnoProfiles,
              {
                userId: interaction.user.id,
                username: newUser.username,
              },
              {
                name: verified.name,
                admno: verified.admno,
              }
            );
          } catch (error) {
            console.error('Error sending notifications:', error);
          }
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.code === 11000) {
        return void (await interaction
          .followUp({
            content: '❌ A database conflict occurred. Your Discord account may already be linked. Try `/profile` to check your current status.',
            ephemeral: true,
          })
          .catch(console.error));
      }
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

      const allLinkedProfiles = await Profile.find({ admno: verified.admno });
      const isMultipleAccounts = allLinkedProfiles.length > 1;
      
      const successMessage = isMultipleAccounts 
        ? `You have been verified! ${verified.name} :white_check_mark:\n\n📌 This university profile is now linked to ${allLinkedProfiles.length} Discord account(s).`
        : `You have been verified! ${verified.name} :white_check_mark:`;

      await interaction
        .followUp({
          content: successMessage,
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
