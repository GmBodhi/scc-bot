const { Client, IntentsBitField, Collection } = require('discord.js');
const config = require('./config');

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages],
});

client.commands = new Collection();
client.interactions = new Collection();

require('./commandHandler')(client);

client.login(config.token);
