require('dotenv').config()
const Discord = require('discord.js')

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  partials: ['MESSAGE', 'CHANNEL']
})

client.on('ready', async () => {
  const channel = client.channels.cache.get(process.env.HACKER_ID)
  await channel.send('!github')
  await channel.send('!npm-all')
  await channel.send('!trending-movies')
  await channel.send('!upcoming-games')
  await channel.send('!upcoming-movies')
  process.exit()
})

client.login(process.env.DISCORD_TOKEN)
