const { MessageFlags } = require('discord.js');
const { EtLabScraper } = require('../../crawler');
const config = require('../config');
const Profile = require('../db/models/profile.model');

const crawler = new EtLabScraper();

module.exports = {
  id: 'scc_verify',
  execute: async (/** @type {import("discord.js").ModalSubmitInteraction} */ interaction) => {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    if (interaction.member?.roles.cache.has(config.VERIFIED_ROLE_ID))
      return await interaction.followUp({
        content: "You're already verified!",
        ephemeral: true,
      });

    const username = interaction.fields.getTextInputValue('scc_verify_username');
    const password = interaction.fields.getTextInputValue('scc_verify_password');

    // Verify the user
    const verified = await crawler.getData(username, password).catch(() => null);

    if (!verified?.admno)
      return await interaction.followUp({
        content:
          ":x: You're not verified :x: \n**:warning: If you think this is a mistake, try again or contact <@830394727684898856>**",
        ephemeral: true,
      });

    console.log(verified);

    const profile = await Profile.findOneAndUpdate(
      { id: interaction.user.id },
      {
        ...verified,
        id: interaction.user.id,
      },
      { upsert: true, new: true }
    );

    if (!profile)
      return await interaction.followUp({
        content: "Sorry, I couldn't verify you. Please try again.",
        ephemeral: true,
      });

    if (!interaction.member) {
      const guild = interaction.client.guilds.cache.get(config.GUILD_ID);
      if (!guild) return interaction.followUp({ content: 'Something went wrong. Please try again', ephemeral: true });
      interaction.member = await guild.members.fetch(interaction.user.id).catch(() => null);
      if (!interaction.member) return interaction.followUp({ content: 'Something went wrong. Please try again', ephemeral: true });
    }

    interaction.member?.roles.add(config.VERIFIED_ROLE_ID);

    await interaction.followUp({
      content: `You have been verified! ${verified.name} :white_check_mark:`,
      ephemeral: true,
    });

    //
  },
};
