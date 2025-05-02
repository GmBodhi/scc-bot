/**
 * @module index
 */

require('dotenv').config();

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

try {
  require('./bot/db/dbConnection');
  require('./bot');
} catch (error) {
  console.error('Error during startup:', error);
  process.exit(1);
}
