require('dotenv').config()
const Discord = require('discord.js')

const client = new Discord.Client({ 
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  partials: ['MESSAGE', 'CHANNEL']
})

client.on('ready', async () => {
  const channel = client.channels.cache.get(process.env.HACKER_ID)
  channel.send('!github')
  channel.send('!npm-category')
  channel.send('!npm-all')
  channel.send('!upcoming-games')
  channel.send('!update')
  channel.send('!upcoming-movies')
  channel.send('!trending-movies')
  await channel.send('!trending-tv')
  process.exit()
})

client.login(process.env.DISCORD_TOKEN)