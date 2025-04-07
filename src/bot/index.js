const { Client, IntentsBitField, Collection } = require('discord.js');
const config = require('./config');
const { init_events } = require('./events');

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

client.commands = new Collection();
client.interactions = new Collection();

require('./commandHandler')(client);
init_events(client);

client.login(config.token);
