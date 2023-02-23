require('dotenv').config()
const Discord = require('discord.js')

const client = new Discord.Client({ 
  intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages], 
  partials: [Discord.Partials.Message, Discord.Partials.Channel]
})

client.on('ready', async () => {
  const channel = client.channels.cache.get(process.env.HACKER_ID)
  await channel.send('!github')
  await channel.send('!npm')
  await channel.send('!upcoming-movies')
  await channel.send('!trending-movies')
  await channel.send('!tv')
  await channel.send('!games')
  await channel.send('!pypi')
  process.exit()
})

client.login(process.env.DISCORD_TOKEN)
