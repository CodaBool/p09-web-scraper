require('dotenv').config()
const Discord = require('discord.js')

const client = new Discord.Client({ 
  intents: ['GUILDS', 'DIRECT_MESSAGES', 'GUILD_MESSAGES', 'GUILD_MEMBERS'], 
  partials: ['MESSAGE', 'CHANNEL']
})

client.on('ready', () => {
  console.log('ready')
  // let day = new Date().getDate()
  const channel = client.channels.cache.get(process.env.HACKER_ID)
  channel.send('!h')
})
// client.on('messageCreate', async msg =>{
//   if (msg.content === '!any-bots') {
//     client.channels.cache.get(process.env.HACKER_ID).send('yo')
// 	}
// })

client.login(process.env.DISCORD_TOKEN)