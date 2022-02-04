require('dotenv').config()
const Discord = require('discord.js')

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  partials: ['MESSAGE', 'CHANNEL']
})

client.on('ready', async () => {
  const channel = await client.channels.cache.get(process.env.HACKER_ID)
  channel.send('!update all')
  .catch(err => console.log('err', err))
  .finally(() => {
    console.log('ok')
    // process.exit()
  })
})
