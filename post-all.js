require('dotenv').config()
const Discord = require('discord.js')

const client = new Discord.Client({ 
  intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages], 
  partials: [Discord.Partials.Message, Discord.Partials.Channel]
})

client.on('ready', async () => {
  const channel = client.channels.cache.get(process.env.HACKER_ID)
  await channel.send('!github')
  await channel.send('!npm-all')
  await channel.send('!npm-category')
  await channel.send('!trending-movies')
  await channel.send('!trending-tv')
  await channel.send('!upcoming-games')
  await channel.send('!upcoming-movies')
  process.exit()
})

client.login(process.env.DISCORD_TOKEN)
