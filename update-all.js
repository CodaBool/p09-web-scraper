require('dotenv').config()
const Discord = require('discord.js')

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  partials: ['MESSAGE', 'CHANNEL']
})

client.on('ready', async () => {
  const channel = client.channels.cache.get(process.env.HACKER_ID)
  await channel.send('!monthly-update all')
  process.exit()
})

client.login(process.env.DISCORD_TOKEN)
