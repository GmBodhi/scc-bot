/**
 * @param {import("discord.js").Client} client
 */
exports.init_events = (client) => {
  require('./memberAdd')(client);
  require('./messageCreate')(client);
};
