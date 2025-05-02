const { Client, IntentsBitField, Collection } = require('discord.js');
const config = require('./config');
const { init_events } = require('./events');

/**
 * @type {Client}
 */
const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages],
  presence: {
    status: 'dnd',
    activities: [
      {
        name: "Don't worry, I won't bite.",
        type: 1,
      },
    ],
  },
});

/**
 * @type {Collection}
 */
client.commands = new Collection();

/**
 * @type {Collection}
 */
client.interactions = new Collection();

require('./commandHandler')(client);
init_events(client);

client.login(config.token).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});
