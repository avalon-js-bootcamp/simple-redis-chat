require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
});

const app = express();

app.use(bodyParser.json());

function isValidString(string) {
    return string && typeof string === 'string' && string.length > 0 && string.length < 256;
}

app.post('/chat', async (req, res) => {
  const { author, message } = req.body;

  if (isValidString(author) === false || isValidString(message) === false) {
    res.status(400).send('Invalid request body');
    return;
  }

  const timestamp = Date.now();

  try {
    await redis.lpush('chat-messages', JSON.stringify({ author, message, timestamp }));
    await redis.ltrim('chat-messages', 0, 19); // keep only the latest 20 messages
    res.status(200).send('Message saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Failed to save the message');
  }
});

app.get('/chat', async (req, res) => {
  try {
    const messages = await redis.lrange('chat-messages', 0, -1);
    res.status(200).send(messages.map(JSON.parse));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error getting messages from Redis');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});