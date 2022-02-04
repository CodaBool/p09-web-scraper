require('dotenv').config()
const Discord = require('discord.js')

const client = new Discord.Client({ 
  intents: ['GUILDS', 'DIRECT_MESSAGES', 'GUILD_MESSAGES', 'GUILD_PRESENCES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS'], 
  partials: ['MESSAGE', 'CHANNEL']
})

// const CODA_BOOL = '684265204007305244'
// const COWPACE = '189075494312869888'
// const XENOPHILE = '311657807361343489'
// const ACID4AIN = '423616944890052629'
// const HOMIES = ['684265204007305244', '311657807361343489', '423616944890052629', '189075494312869888']
const HOMIES = ['189075494312869888', '684265204007305244']

const memes = [
  'https://static1.thegamerimages.com/wordpress/wp-content/uploads/2020/10/League-of-Legends-Yuumi-Dropping-Kaisa-Toy-Story-Woody-Andy.jpg?q=50&fit=crop&w=960&dpr=1.5',
  'https://c.tenor.com/GBiG_eaFRYcAAAAM/league-of-legends-want-to-play.gif',
  'https://funvizeo.com/media/memes/1720340e8b691d77/you-dont-play-league-of-legends-meme-7d361314f97d0c3c-cde1e2a804f8fe63.jpg',
  'https://i.pinimg.com/originals/85/5e/58/855e5889c2cd789de65fb60c943ef9d0.jpg',
  'https://remote-tools-images.s3.amazonaws.com/league-of-legends-memes/37.jpg',
  'https://preview.redd.it/46upjv2m52281.jpg?width=640&crop=smart&auto=webp&s=3029d664e1ec36041014b2f3ce08bd56ad84ee14',
  'https://img.ifunny.co/images/1145afaf70fc36be28dce93b66ad6a3909f2f5fb5c05025100d369dca4e93566_1.jpg',
  'https://www.lolfinity.com/wp-content/uploads/2020/04/No-Zed-Stop.jpg',
  'https://i.kym-cdn.com/photos/images/original/001/881/998/8a5.jpg',
  'https://i.redd.it/pzytd4cpxv251.jpg',
  'https://preview.redd.it/acs3a2sn7jq61.jpg?width=640&crop=smart&auto=webp&s=4c595fc395f8cad242b72e3af1ccb1c996dc6e4f',
  'https://pbs.twimg.com/media/FHpLUeOWQAYUY8V?format=jpg&name=small',
  'https://pbs.twimg.com/media/FJOx79qWQAwN4Xd?format=png&name=small',
  'https://twitter.com/ForestWithin/status/1372390642157027334',
  'https://twitter.com/Riot_Kassadin/status/1434146524284526601',
  'https://twitter.com/Riot_Kassadin/status/1446488659125997573',
  'https://twitter.com/Riot_Kassadin/status/1458928838679973892',
  'https://twitter.com/Riot_Kassadin/status/1460313959584645120',
  'https://twitter.com/Riot_Kassadin/status/1473350839423098880',
  'https://twitter.com/Riot_Kassadin/status/1481308867904552967',
  'https://twitter.com/Riot_Kassadin/status/1484887013430079493',
  'https://www.youtube.com/watch?v=b91jJ7HNsXQ'
]

client.on('ready', async () => {
  const lolkicks = client.guilds.cache.get(process.env.LOLKICK_ID)
  const members = lolkicks.members.cache.filter(member => HOMIES.includes(member.user.id))
  members.map(member => {
    const name = member.user.username
    const activity = member.presence?.activities[0]?.name
    const id = member.user.id
    if (activity === 'League of Legends') {
      client.users.fetch(id, false).then(user => {
        const meme = memes[Math.floor(Math.random()*memes.length)]
        user.send(`nice cock ${name}\n${meme}`)
      })
    }
  })
})

client.login(process.env.DISCORD_TOKEN)