require('dotenv').config();

const { Client, Collection, GatewayIntentBits } = require('discord.js');

const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

// Load commands
commandHandler(client);

// Load events
eventHandler(client);

// Login
client.login(process.env.DISCORD_TOKEN);
