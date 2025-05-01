const {  MessageFlags } = require('discord.js');

module.exports = {
  id: 'scc_reaction_role_',
  /**
   * @param {import("discord.js").ButtonInteraction} interaction
   * @returns {Promise<void>}
   */
  execute: async (/** @type {import("discord.js").ButtonInteraction} */ interaction) => {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    try {
      const member = interaction.member;

      const role = interaction.guild?.roles.cache.get(interaction.customId.split('_')[3]);

      if (!role || !member) {
        await interaction.followUp({
          content: 'Role or Member not cached, please try again',
          ephemeral: true,
        });
        return;
      }

      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        await interaction.followUp({
          content: `Removed ${role.name} role`,
          ephemeral: true,
        });
      } else {
        await member.roles.add(role);
        await interaction.followUp({
          content: `Added ${role.name} role`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);

      await interaction.followUp({
        content: 'Something went wrong',
        ephemeral: true,
      });
    }

    //
  },
};
