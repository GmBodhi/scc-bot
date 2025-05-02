const fs = require('fs');
const path = require('path');
const config = require('./config');

//

/**
 * @param {import("discord.js").Client} client
 */
module.exports = (client) => {
  const dir = path.join(__dirname, 'commands');
  const interactiondir = path.join(__dirname, 'interactions');

  const files = fs.readdirSync(dir);
  const interactionfiles = fs.readdirSync(interactiondir);

  for (const file of files) {
    const command = require(path.join(dir, file));
    client.commands.set(command.name, command);
  }

  for (const file of interactionfiles) {
    const interaction = require(path.join(interactiondir, file));
    if (Array.isArray(interaction.id)) {
      for (const id of interaction.id) {
        client.interactions.set(id, interaction);
      }
    } else client.interactions.set(interaction.id, interaction);
  }

  client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    await registerCommands(client);
  });

  client.on('interactionCreate', async (/** @type {import("discord.js").Interaction}*/ interaction) => {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        }).catch(console.error);
      }
    } else if (interaction.customId) {
      try {
        await client.interactions.get(interaction.customId)?.execute(interaction);
      } catch (error) {
        console.error(error);
      }
    } else {
      const command = client.commands.get(interaction.customId);
      if (command) return command.execute(interaction).catch(console.error);

      const fallback = client.interactions.find((i) => interaction.customId?.startsWith(i.id));
      if (fallback) {
        try {
          await fallback.execute(interaction).catch(console.error);
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
};

//

/**
 * @param {import("discord.js").Client} client
 * @returns {Promise<void>}
 */
const registerCommands = async (client) => {
  const commands = client.commands.map((command) => ({
    name: command.name,
    description: command.description,
    options: command.options,
  }));

  await (await client.guilds.fetch(config.GUILD_ID)).commands.set(commands);
};
