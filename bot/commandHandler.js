const { MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { EtLabScraper } = require('../crawler');
const config = require('./config');

const crawler = new EtLabScraper();

//

/** @param {import("discord.js").Client} client */
module.exports = (client) => {
  const dir = path.join(__dirname, 'commands');
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const command = require(path.join(dir, file));
    client.commands.set(command.name, command);
  }

  client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    await registerCommands(client);
  });

  client.on('interactionCreate', async (/** @type {import("discord.js").Interaction}*/ interaction) => {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      console.log(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    } else {
      // TODO: CREATE A handler for this

      if (interaction.customId === 'scc_verify') {
        await interaction.deferReply({
          flags: MessageFlags.Ephemeral,
        });

        const username = interaction.fields.getTextInputValue('scc_verify_username');
        const password = interaction.fields.getTextInputValue('scc_verify_password');

        // Verify the user
        const verified = await crawler.getData(username, password).catch(() => null);

        console.log(verified);

        if (verified?.admNo) {
          interaction.member?.roles.add(config.VERIFIED_ROLE_ID);
          await interaction.followUp({
            content: 'You have been verified! :white_check_mark:',
            ephemeral: true,
          });
        } else {
          await interaction.followUp({
            content: ":x: You're not verified :x: \n**:warning: If you think this is a mistake, try again.**",
            ephemeral: true,
          });
        }
      }
    }
  });
};

//

/** @param {import("discord.js").Client} client */
const registerCommands = async (client) => {
  const commands = client.commands.map((command) => ({
    name: command.name,
    description: command.description,
    options: command.options,
  }));

  await (await client.guilds.fetch(config.GUILD_ID)).commands.set(commands);
};
