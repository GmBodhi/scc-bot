const mongoose = require('mongoose');

/**
 * @type {string}
 */
const MONGODB_URI = process.env.MONGO_URL;

const MAX_RETRY_ATTEMPTS = 5;

let retryCount = 0;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    retryCount = 0;
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

async function reconnect() {
  try {
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      retryCount++;
      const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
      console.log(`Reconnecting to MongoDB in ${backoffTime}ms (attempt ${retryCount})`);
      
      setTimeout(async () => {
        try {
          await mongoose.connect(MONGODB_URI);
          console.log('Successfully reconnected to MongoDB');
          retryCount = 0;
        } catch (error) {
          console.error('Failed to reconnect:', error);
          await reconnect();
        }
      }, backoffTime);
    } else {
      console.error(`Failed to reconnect after ${MAX_RETRY_ATTEMPTS} attempts`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error in reconnect function:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', async () => {
  console.log('MongoDB disconnected');
  await reconnect();
});
