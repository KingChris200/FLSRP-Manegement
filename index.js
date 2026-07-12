const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: GatewayIntentBits.Guilds });

client.on('ready', () => {
 console.log(`✅ ${client.user.tag} is online!`);
});

client.on('interactionCreate', async interaction => {
 if (!interaction.isChatInputCommand()) return;

 const { commandName, options } = interaction;

 switch (commandName) {
 case 'getinfo': {
 const user = options.getUser('user') || interaction.user;
 await interaction.reply(`📋 **${user.tag}**\nID: \`${user.id}\`\nJoined Discord: ${user.createdAt.toDateString()}`);
 break;
 }

 case 'logs': {
 if (options.getSubcommand() === 'view') {
 const target = options.getUser('user');
 await interaction.reply(`📜 Fetching logs for **${target.tag}**... (database setup coming soon)`);
 }
 break;
 }

 case 'shift': {
 if (options.getSubcommand() === 'manage') {
 const action = options.getString('action');
 await interaction.reply(`⏱️ Shift **${action}** logged!`);
 }
 break;
 }

 case 'ticket': {
 if (options.getSubcommand() === 'rename') {
 const newName = options.getString('name');
 const channel = interaction.channel;
 try {
 await channel.setName(newName);
 await interaction.reply(`✅ Ticket renamed to **${newName}**`);
 } catch (err) {
 await interaction.reply({ content: '❌ Could not rename this channel. Make sure this is a ticket channel!', ephemeral: true });
 }
 }
 break;
 }

 case 'erlc': {
 if (options.getSubcommand() === 'command') {
 const cmd = options.getString('command_text');
 await interaction.reply(`⚡ Running ER:LC command: \`${cmd}\`\n*(ER:LC API integration coming soon)*`);
 }
 break;
 }

 case 'announce': {
 if (options.getSubcommand() === 'now') {
 const message = options.getString('message');
 await interaction.channel.send(`📢 **ANNOUNCEMENT**\n${message}`);
 await interaction.reply({ content: '✅ Announcement sent!', ephemeral: true });
 }
 break;
 }

 default:
 await interaction.reply('❓ Unknown command');
 }
});

client.login(process.env.DISCORD_TOKEN);
