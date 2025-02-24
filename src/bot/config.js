/**
 * @type {{
 *  token: string;
 *  GUILD_ID: string;
 *  VERIFIED_ROLE_ID: string;
 * }}
 **/
const config = {
  token: process.env.DISCORD_TOKEN,
  GUILD_ID: process.env.GUILD_ID,
  VERIFIED_ROLE_ID: process.env.VERIFIED_ROLE_ID,
};

module.exports = config;
