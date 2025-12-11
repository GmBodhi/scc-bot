/**
 * @module index
 */

require('dotenv').config();
const express = require("express")

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express()

app.get("/", (req, res) => {
  return res.json({ success: true })
})

app.listen(80)

try {
  require('./bot/db/dbConnection');
  require('./bot');
} catch (error) {
  console.error('Error during startup:', error);
  process.exit(1);
}
