require('dotenv').config()
const Discord = require('discord.js')
const asTable = require('as-table')
const pg = require('pg')
const axios = require('axios')

// codabool = 684265204007305244
// xenophile = 311657807361343489
// acid4ain = 423616944890052629
// cowpace = 189075494312869888

const CODA_BOOL = '684265204007305244'
const COWPACE = '189075494312869888'
const XENOPHILE = '311657807361343489'
const ACID4AIN = '423616944890052629'
const API_URL = 'https://j8xl9nv9k9.execute-api.us-east-1.amazonaws.com/main/api'

const HOMIES = ['684265204007305244', '311657807361343489', '423616944890052629', '189075494312869888']

// const allIntents = new Intents(32767)
const client = new Discord.Client({ 
  intents: ['GUILDS', 'DIRECT_MESSAGES', 'GUILD_MESSAGES', 'GUILD_PRESENCES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS'], 
  partials: ['MESSAGE', 'CHANNEL']
})

client.on('ready', async () => {
  console.log('ready')
  // client.users.fetch(COWPACE, false).then(user => {
  //   user.send(`nice cock`)
  // })
  // const lolkicks = client.guilds.cache.get(process.env.LOLKICK_ID)
  // const members = lolkicks.members.cache.filter(member => HOMIES.includes(member.user.id))
  // members.map(member => {
  //   const name = member.user.username
  //   const activity = member.presence?.activities[0]?.name
  //   if (activity === 'League of Legends') {
  //     let id = CODA_BOOL
  //     if (name ==='Cowpace') {
  //       id = COWPACE
  //     } else if (name ==='xenophile') {
  //       id = XENOPHILE
  //     } else if (name ==='acid4ain') {
  //       id = ACID4AIN
  //     }
  //     client.users.fetch(id, false).then(user => {
  //       user.send(`nice cock ${name}`)
  //     })
  //   }
  // })
})

client.on('messageCreate', async msg =>{
  if (msg.content === '!any-bots') {
    // console.log('user', msg.author)
    client.channels.cache.get(process.env.HACKER_ID).send('yo')
	}
  if (msg.content === '!help' || msg.content.includes('!h')) {
		const channel = client.channels.cache.get(process.env.HACKER_ID)
		let embed = new Discord.MessageEmbed()
				.setColor('#204194')
				.addFields([{
					name: '!update',
					value: 'this will update the scraped data in the database'
				}, {
					name: '!github',
					value: 'Shows the trending github repos'
				}, {
					name: '!upcoming-movies',
					value: 'Shows the upcoming movies from imdb'
				}, {
					name: '!trending-movies',
					value: 'Shows the popular movies from imdb'
				}, {
					name: '!trending-tv',
					value: 'Shows the popular tv shows from imdb'
				}, {
					name: '!upcoming-games',
					value: 'Shows the upcoming steam games'
				}, {
					name: '!npm-backend',
					value: 'Shows the popular npm packages under the backend category from npmjs.com'
				}, {
					name: '!npm-all',
					value: 'Shows the all popular npm packages from libraries.io'
				}])
				.setTitle('Commands')
				.setAuthor({ name: 'CodaBot', url: 'https://github.com/CodaBool/p09-scraper-consumer/blob/main/discord-bot/index.js', iconURL: 'https://i.imgur.com/pHPpNA6.png' })
				.setThumbnail('https://i.imgur.com/ShZVJwz.png')
      channel.send({embeds: [embed]})
	}
	if (msg.content === '!github') {
    const res = await query('SELECT * FROM trending_github')
    const githubChannel = client.channels.cache.get(process.env.GITHUB_ID)
		console.log('channel', githubChannel)
    // breaks 100 results into 5 arrays of twenty
    const reducedArr = reduce(res, 20)

    for (let j = 0; j < 5; j++) {
      const data = []
      for (let i = 0; i < 20; i++) {
        if (reducedArr[j][i]) {
          data.push({
            stars: reducedArr[j][i].stars,
            repo: reducedArr[j][i].name,
            description: reducedArr[j][i].description.slice(0, 35)
          })
        }
      }
      githubChannel.send('```md\npage (' + (j + 1) + '/5)\n' + asTable(data) + '```')
    }
    // ============ SINGLE asTable ============
    // guide https://anidiots.guide/first-bot/using-embeds-in-messages
    // const exampleEmbed = new Discord.MessageEmbed() // embed max 6000
    // 	.setColor('#de0000')
    // 	.setTitle('Github top 100 repos by stars')
    // 	.setDescription('```md\n'+ table.toString() +'```')
    // .setFooter('GITHUB')
    // const channel = client.channels.cache.get(CHANNEL_ID)
    // channel.send(exampleEmbed)
	}
	if (msg.content === '!npm-backend') {
    const res = await query('SELECT * FROM trending_npm_1')
    const channel = client.channels.cache.get(process.env.NPM_ID)

    const reducedArr = reduce(res, 20)
    for (let j = 0; j < 5; j++) {
      const data = []
      for (let i = 0; i < 20; i++) {
        if (reducedArr[j][i]) {
          data.push({
            package: reducedArr[j][i].title,
            description: reducedArr[j][i].description.slice(0, 35)
          })
        }
      }
      // console.log('DEBUG: sending table with', asTable(data).length, 'length') // 2000
      channel.send('```md\npage (' + (j + 1) + '/5)\n' + asTable(data) + '```')
    }
	}
	if (msg.content === '!npm-all') {
    const res = await query('SELECT * FROM trending_npm_2')

    const channel = client.channels.cache.get(process.env.NPM_ID)
    const reducedArr = reduce(res, 20)
    for (let j = 0; j < 5; j++) {
      const data = []
      for (let i = 0; i < 20; i++) {
        if (reducedArr[j][i]) {
          data.push({
            stars: reducedArr[j][i].stars.split(' ')[0],
            package: reducedArr[j][i].name,
            description: reducedArr[j][i].description.slice(0, 30)
          })
        }
      }
      console.log('DEBUG: sending table with', asTable(data).length, 'length') // 2000
      channel.send('```md\npage (' + (j + 1) + '/5)\n' + asTable(data) + '```')
    }
	}
	if (msg.content === '!upcoming-games') {
    const res = await query('SELECT * FROM upcoming_games')
    const channel = client.channels.cache.get(process.env.GAMES_ID)
    let desc = ''
    res.forEach((game, index) => {
      if (index < 30) desc +=`[🔗](${game.link}) ${game.name}\n`
    })
    const embed = new Discord.MessageEmbed() // embed max 6000
      .setColor('#de0000')
      .setTitle('Upcoming Games')
      .setDescription(desc)
    channel.send({embeds: [embed]})
	}
	if (msg.content.includes('!update') && !msg.author.bot) {
		const channel = client.channels.cache.get(process.env.HACKER_ID)
		const args = msg.content.split(' ').filter(item => item !== '!update') // remove initial !update
		if (args.includes('all')) {
			['upcoming_movies', 'trending_movies', 'trending_tv', 'upcoming_games', 'trending_npm_1', 'trending_npm_2', 'trending_github'].forEach(item => {
				console.log('update all requests', `${API_URL}/${item}?key=${process.env.KEY}`)
				axios.get(`${API_URL}/${item}?key=${process.env.KEY}`)
					.then(() => channel.send(`✅ Database successfully updated ${item} collection`))
					.catch(err => channel.send(`😨 Something went wrong ${err}`))
			})
		} else {
			let embed = new Discord.MessageEmbed()
				.setColor('#204194')
				.setDescription('Select a reaction button corresponding to the item in the numbered list of database collections. This will send a request for new data to be scraped. The update command will only watch for reactions for 15 seconds and will add the 🛑 reaction to show that the command is no longer listening.')
				.addFields([{
					name: 'Collections',
					value: '1. ALL\n2. upcoming_movies\n3. trending_movies\n4. trending_tv\n5. upcoming_games\n6. trending_npm_1\n7. trending_npm_2\n8. trending_github'
				}])
				.setTitle('Update Database')
				.setAuthor({ name: 'CodaBot', url: 'https://github.com/CodaBool/p09-scraper-consumer/blob/main/discord-bot/index.js', iconURL: 'https://i.imgur.com/pHPpNA6.png' })
				.setThumbnail('https://cdn.dribbble.com/users/160117/screenshots/3197970/media/51a6e132b11664f7f2085bb6a35fc628.gif')
			const message = await channel.send({embeds: [embed]})
			message.react('1⃣')
			message.react('2⃣')
			message.react('3⃣')
			message.react('4⃣')
			message.react('5⃣')
			message.react('6⃣')
			message.react('7⃣')
			message.react('8⃣')
			const collected = await message.awaitReactions({ filter: () => true, maxUsers: 2 })
			const emote = collected.filter(emote => emote.count > 1).entries().next().value[0]
			let path = ''
			if (emote === '1⃣') {
				['upcoming_movies', 'trending_movies', 'trending_tv', 'upcoming_games', 'trending_npm_1', 'trending_npm_2', 'trending_github'].forEach(item => {
					console.log('request to', `${API_URL}/${item}?key=${process.env.KEY}`)
					axios.get(`${API_URL}/${item}?key=${process.env.KEY}`)
						.then(() => channel.send(`✅ Database successfully updated ${item} collection`))
						.catch(err => channel.send(`😨 Something went wrong ${err}`))
				})
			} else if (emote === '2⃣') {
				path = 'upcoming_movies'
			} else if (emote === '3⃣') {
				path = 'trending_movies'
			} else if (emote === '4⃣') {
				path = 'trending_tv'
			} else if (emote === '5⃣') {
				path = 'upcoming_games'
			} else if (emote === '6⃣') {
				path = 'trending_npm_1'
			} else if (emote === '7⃣') {
				path = 'trending_npm_2'
			} else if (emote === '8⃣') {
				path = 'trending_github'
			}
			if (path) {
				console.log('request to', `${API_URL}/${path}?key=${process.env.KEY}`)
				axios.get(`${API_URL}/${path}?key=${process.env.KEY}`)
					.then(() => channel.send(`✅ Database successfully updated ${path} collection`))
					.catch(err => channel.send(`😨 Something went wrong ${err}`))
			}
			message.react('🛑')

		}
	}
	if (msg.content === '!upcoming-movies') {
    const res = await query('SELECT * FROM upcoming_movies')
		const updatedAt = new Date(res[0].updated_at).toDateString()
		const channel = client.channels.cache.get(process.env.MOVIES_ID)
		const rawMovies = res[0].raw_json
    const fields = []

		const groupedByDate = groupBy(rawMovies, 'date')

    for (const [date, movies] of Object.entries(groupedByDate)) {
			console.log(date)
			console.log(movies.length)
			let value = ''
			for (const movie of movies) {
				console.log(movie)
				value += movie.title + '\n'
			}
			fields.push({ name: date, value })
    }
    let monthEmbed = new Discord.MessageEmbed() // embed max 6000
      .setColor('#FFFF00')
      .addFields(...fields)
      .setTitle('Upcoming Movies')
      .setURL('https://www.imdb.com/calendar')
      .setThumbnail('http://icons.iconarchive.com/icons/danleech/simple/1024/imdb-icon.png')
			.setAuthor({ name: 'CodaBot', url: 'https://codabool.com', iconURL: 'https://avatars.githubusercontent.com/u/61724833?v=4' })
			.setFooter({text: 'Scraped ' + updatedAt, iconURL: 'http://icons.iconarchive.com/icons/danleech/simple/1024/imdb-icon.png'})
		channel.send({embeds: [monthEmbed]})
	}
	if (msg.content === '!trending-movies') {
		const res = await query('SELECT * FROM trending_movies')
		const date = new Date(res[0].updated_at).toDateString()
		const reducedArr = reduce(res, 25)
		const channel = client.channels.cache.get(process.env.MOVIES_ID)
		for (let j = 0; j < 4; j++) {
			const fields = []
			for (let i = 0; i < 25; i++) {
				if (reducedArr[j][i]) {
					let rating = ''
					if (reducedArr[j][i].rating) {
						rating = `★${reducedArr[j][i].rating}`
					} else {
						rating = ' n/a'
					}
					let velocity = ''
					if (reducedArr[j][i].velocity < 0) {
						velocity = ` (${reducedArr[j][i].velocity})`
					} else if (reducedArr[j][i].velocity > 0) {
						velocity = ` (+${reducedArr[j][i].velocity})`
					} else if (reducedArr[j][i].velocity === 0) {
						velocity = ' (0)'
					}
					fields.push({
						name: '#' + reducedArr[j][i].rank + ' ' + reducedArr[j][i].title,
						value: `${rating} ${velocity}`
					})
				}
			}
			const monthEmbed = new Discord.MessageEmbed() // embed max 6000
				.setColor('#FFFF00')
				.addFields(...fields)
				.setTitle('Trending Movies')
				.setURL('https://www.imdb.com/chart/moviemeter')
				.setThumbnail('http://icons.iconarchive.com/icons/danleech/simple/1024/imdb-icon.png')
				.setAuthor({ name: 'CodaBot', url: 'https://codabool.com', iconURL: 'https://avatars.githubusercontent.com/u/61724833?v=4' })
				.setFooter({text: 'Scraped ' + date, iconURL: 'http://icons.iconarchive.com/icons/danleech/simple/1024/imdb-icon.png'})
			channel.send({embeds: [monthEmbed]})
		}
	}
	if (msg.content === '!trending-tv') {
		// TODO: args https://discordjs.guide/creating-your-bot/commands-with-user-input.html#basic-arguments
		// const args = msg.content.slice(12).trim().split(' ')
		// console.log('args', args)
		const res = await query('SELECT * FROM trending_tv')
		const date = new Date(res[0].updated_at).toDateString()
		const reducedArr = reduce(res, 25)
		const channel = client.channels.cache.get(process.env.TV_ID)
		for (let j = 0; j < 4; j++) {
			const fields = []
			for (let i = 0; i < 25; i++) {
				if (reducedArr[j][i]) {
					let rating = ''
					if (reducedArr[j][i].rating) {
						rating = `★${reducedArr[j][i].rating}`
					} else {
						rating = ' n/a'
					}
					let emoji = ''
					if (reducedArr[j][i].velocity < 0) {
						emoji = ` (${reducedArr[j][i].velocity})`
					} else if (reducedArr[j][i].velocity > 0) {
						emoji = ` (+${reducedArr[j][i].velocity})`
					} else if (reducedArr[j][i].velocity === 0) {
						emoji = ' (0)'
					}
					fields.push({
						name: '#' + reducedArr[j][i].rank + ' ' + reducedArr[j][i].title,
						value: `${rating} ${emoji}`
					})
				}
			}
			console.log(fields)
			const monthEmbed = new Discord.MessageEmbed() // embed max 6000
				.setColor('#FFFF00')
				.addFields(...fields)
				.setTitle('Trending TV')
				.setURL('https://www.imdb.com/chart/tvmeter')
				.setThumbnail('http://icons.iconarchive.com/icons/danleech/simple/1024/imdb-icon.png')
				.setAuthor({ name: 'CodaBot', url: 'https://codabool.com', iconURL: 'https://avatars.githubusercontent.com/u/61724833?v=4' })
				.setFooter({text: 'Scraped ' + date, iconURL: 'http://icons.iconarchive.com/icons/danleech/simple/1024/imdb-icon.png'})
			channel.send({embeds: [monthEmbed]})
		}
	}
})

client.login(process.env.DISCORD_TOKEN)

function reduce(arr, chunkSize) {
  return arr.reduce((all, one, i) => {
    const ch = Math.floor(i/chunkSize)
    all[ch] = [].concat((all[ch]||[]), one)
    return all
  }, [])
}

// https://stackoverflow.com/questions/38575721/grouping-json-by-values
function groupBy(xs, key) {
	return xs.reduce(function(rv, x) {
		(rv[x[key]] = rv[x[key]] || []).push(x)
		return rv
	}, {})
}

async function query(sql) {
	const db = new pg.Client({ 
		connectionString: process.env.PG_URI, 
		ssl: { rejectUnauthorized: false } 
	})
  try {
    await db.connect()
    const data = await db.query(sql)
      .then(res => res.rows)
      .catch(err => console.error('query err', err.stack))
    return data
  } catch (err) {
		console.error('query err', err)
    return err
  } finally {
    await db.end()
  }
}