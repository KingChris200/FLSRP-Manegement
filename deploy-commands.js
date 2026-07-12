const { REST, Routes } = require('discord.js');
require('dotenv').config(); // loads your.env file if you have one locally

const commands = {
 name: 'getinfo',
 description: 'Get Discord or Roblox info. If no arguments, gets your Roblox info.',
 options:  {
 name: 'user',
 description: 'The user to get info about',
 type: 6,
 required: false,
 },
,
 },
 {
 name: 'logs',
 description: 'View the logs of a user',
 options: {
 name: 'view',
 description: 'View logs',
 type: 1,
 options: [
 {
 name: 'user',
 description: 'The user to check',
 type: 6,
 required: true,
 },
,
 },
 ,
 },
 {
 name: 'shift',
 description: 'Manage your shift',
 options: {
 name: 'manage',
 description: 'Manage shift',
 type: 1,
 options:  {
 name: 'action',
 description: 'start, end, or status',
 type: 3,
 required: true,
 choices: [
 { name: 'Start', value: 'start' },
 { name: 'End', value: 'end' },
 { name: 'Status', value: 'status' },
,
 },
 ,
 },
 ],
 },
 {
 name: 'ticket',
 description: 'Ticket commands',
 options: {
 name: 'rename',
 description: 'Give the current ticket a new name',
 type: 1,
 options:  {
 name: 'name',
 description: 'New ticket name',
 type: 3,
 required: true,
 },
,
 },
 ,
 },
 {
 name: 'erlc',
 description: 'ER:LC commands',
 options: {
 name: 'command',
 description: 'Runs an ER:LC command in-game',
 type: 1,
 options:  {
 name: 'command_text',
 description: 'The command to run',
 type: 3,
 required: true,
 },
,
 },
 ,
 },
 {
 name: 'announce',
 description: 'Send an announcement',
 options: {
 name: 'now',
 description: 'Send a message',
 type: 1,
 options:  {
 name: 'message',
 description: 'The announcement message',
 type: 3,
 required: true,
 },
,
 },
 ,
 },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
 try {
 console.log('🔄 Registering slash commands...');
 await rest.put(
 Routes.applicationCommands(process.env.CLIENT_ID),
 { body: commands },
 );
 console.log('✅ Commands registered successfully!');
 } catch (error) {
 console.error('❌ Error:', error);
 }
})();
