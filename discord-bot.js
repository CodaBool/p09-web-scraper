require('dotenv').config()
const Discord = require('discord.js')
const asTable = require('as-table')
const pg = require('pg')
const sqs = require('@aws-sdk/client-sqs')

// codabool = 684265204007305244
// xenophile = 311657807361343489
// acid4ain = 423616944890052629
// cowpace = 189075494312869888

const CODA_BOOL = '684265204007305244'
const COWPACE = '189075494312869888'
const XENOPHILE = '311657807361343489'
const ACID4AIN = '423616944890052629'
const API_URL = 'https://t960xe6yf8.execute-api.us-east-1.amazonaws.com/v1'

const HOMIES = ['684265204007305244', '311657807361343489', '423616944890052629', '189075494312869888']

// const allIntents = new Intents(32767)
const client = new Discord.Client({ 
  intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildPresences, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.MessageContent], 
  partials: [Discord.Partials.Message, Discord.Partials.Channel, Discord.Partials.Reaction]
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
		client.channels.cache.get(process.env.HACKER_ID).send('yo')
	}

  if (msg.content === '!help' || msg.content.includes('!h')) {
		const channel = client.channels.cache.get(process.env.HACKER_ID)

		// new Discord.EmbedBuilder()
		// 	.setColor('#204194')

		let embed = new Discord.EmbedBuilder()
			.setColor('#204194')
			.addFields([{
				name: '!update',
				value: 'this will update the scraped data in the database'
			}, {
				name: '!github',
				value: 'Shows the popular github repos for JavaScript, Python and Shell'
			}, {
				name: '!upcoming-movies',
				value: 'Shows the upcoming movies'
			}, {
				name: '!trending-movies',
				value: 'Shows the popular movies'
			}, {
				name: '!tv',
				value: 'Shows the popular tv shows'
			}, {
				name: '!games',
				value: 'Shows the top selling steam games'
			}, {
				name: '!npm',
				value: 'Shows the popular npm packages under all categories from npmjs.com'
			}, {
				name: '!pypi',
				value: 'Shows the popular Python packages'
			}])
			.setTitle('Commands')
			.setAuthor({ name: 'CodaBot', url: 'https://github.com/CodaBool/p09-scraper-consumer/blob/main/discord-bot/index.js', iconURL: 'https://i.imgur.com/pHPpNA6.png' })
			.setThumbnail('https://i.imgur.com/ShZVJwz.png')
		channel.send({embeds: [embed]})
		// msg.channel.send({embeds: [embed]})
	}
	if (msg.content === '!github') {
		//   const LANGUAGES = ["JavaScript", "Python", "Shell"]
    const res = await query('SELECT * FROM trending_github')
    const githubChannel = client.channels.cache.get(process.env.GITHUB_ID)
    const reducedArr = reduce(res, 20)
    for (let j = 0; j < 5; j++) {
      const data = []
      for (let i = 0; i < 20; i++) {
        if (reducedArr[j][i]) {
          data.push({
            stars: Math.floor(reducedArr[j][i].stars / 1000) + 'k',
            repo: reducedArr[j][i].name,
            description: reducedArr[j][i].description.slice(0, 35)
          })
        }
      }
      githubChannel.send('```md\npage (' + (j + 1) + '/5) of Github\n' + asTable(data) + '```')
    }
    // ============ SINGLE asTable ============
    // guide https://anidiots.guide/first-bot/using-embeds-in-messages
    // const exampleEmbed = new Discord.EmbedBuilder() // embed max 6000
    // 	.setColor('#de0000')
    // 	.setTitle('Github top 100 repos by stars')
    // 	.setDescription('```md\n'+ table.toString() +'```')
    // .setFooter('GITHUB')
    // const channel = client.channels.cache.get(CHANNEL_ID)
    // channel.send(exampleEmbed)
	}
	if (msg.content === '!npm') {
		// TODO: you can actually grab a percentage from the scraped npmjs.com page
		// const categories = [
		// 	'backend',
		// 	'front-end',
		// 	'cli',
		// 	'framework',
		// ]
    const res = await query('SELECT * FROM trending_npm ORDER BY subject, rank')
    const channel = client.channels.cache.get(process.env.NPM_ID)

    const reducedArr = reduce(res, 40)
		for (const subject of reducedArr){
			const data = []
			for (const [i, value] of Object.entries(subject)) {
				data.push({
					rank: value.rank,
					package: value.title,
					description: value.description.slice(0, 30),
				})
			}
			const split = reduce(data, 20)
			split.forEach(half => {
				// console.log('DEBUG: sending table with', asTable(half).length, 'length') // 2000
				channel.send('```md\n' + subject[0].subject.toUpperCase() + ' packages scraped ' + new Date(subject[0]['updated_at']).toDateString() + '\n' + asTable(half) + '```')
			})
		}
	}
	if (msg.content === '!pypi') {
    const res = await query('SELECT * FROM trending_pypi')
    const channel = client.channels.cache.get(process.env.PYTHON_ID)
		console.log(res)
    const reducedArr = reduce(res, 20)
    for (let j = 0; j < 5; j++) {
      const data = []
      for (let i = 0; i < 20; i++) {
        if (reducedArr[j][i]) {
          data.push({
            'downloads': Math.floor(reducedArr[j][i].downloads / 1000 / 1000) + 'm',
            package: reducedArr[j][i].name,
            description: reducedArr[j][i].description.slice(0, 30)
          })
        }
      }
      // console.log('DEBUG: sending table with', asTable(data).length, 'length') // 2000
      channel.send('```md\npage (' + (j + 1) + '/5) Scraped ' + new Date(reducedArr[j][0]['updated_at']).toDateString() + '\n' + asTable(data) + '```')
    }
	}
	if (msg.content === '!games') {
    const res = await query('SELECT * FROM trending_games LIMIT 18')
    const channel = client.channels.cache.get(process.env.GAMES_ID)

		const data = []
		for (const [i, game] of Object.entries(res)) {
			let price = '🤷'
			if (game.is_free) {
				price = 'Free'
			} else if (game.regular_price) {
				price = '$' + game.regular_price.slice(0, -2)
			}
			if (game.discounted_price !== null) {
				const percent = Math.floor(((game.discounted_price / game.regular_price) - 1) * -100 )
				price = `${price} -> $${game.discounted_price.slice(0, -2)} (-${percent}% off)`
			}
			data.push({
				title: game.title,
				price: price,
				rating: game.rating,
			})
		}
		console.log(asTable(data).length, 'this must be 2000 or fewer in length')
		channel.send('```md\n  Top ' + data.length + ' Selling Games on Steam\n\n' + asTable(data) + '```')
	}
	if ((msg.content.includes('!update') && !msg.author.bot) || msg.content === '!monthly-update all') {
		const channel = client.channels.cache.get(process.env.HACKER_ID)
		const args = msg.content.split(' ').filter(item => item !== '!update') // remove initial !update
		const promises = []
		const clientSQS = new sqs.SQSClient({ region: "us-east-1" })
		if (args.includes('all')) {
			['upcoming_movies', 'trending_movies', 'tv', 'games', 'npm', 'pypi', 'github'].forEach(item => {
				const command = new sqs.SendMessageCommand({
					MessageBody: `/v1/${item}@${process.env.KEY}`,
					QueueUrl: 'https://sqs.us-east-1.amazonaws.com/919759177803/scraper'
				})
				promises.push(new Promise((resolve, reject) => {
					clientSQS.send(command).then(() => resolve(item)).catch(() => reject(item))
				}))
			})
			await Promise.allSettled(promises)
				.then(results => results.forEach(result => {
					if (result?.status == 'fulfilled') {
						channel.send(`✅ sent a update request to ${result?.value}`)
					} else {
						channel.send(`😨 something went wrong sending update for ${result?.value}`)
					}
				}))
				.finally(() => channel.send('🐶please allow up to 5 minutes for the database to be updated'))
		} else {
			let embed = new Discord.EmbedBuilder()
				.setColor('#204194')
				.setDescription('Select a reaction button corresponding to the item in the numbered list of database collections. This will send a request for new data to be scraped. The update command will only watch for reactions for 15 seconds and will add the 🛑 reaction to show that the command is no longer listening.')
				.addFields([{
					name: 'Collections',
					value: '1. ALL\n2. upcoming_movies\n3. trending_movies\n4. tv\n5. games\n6. npm\n7. pypi\n8. github\n9. print when the last update happened'
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
			message.react('9️⃣')
			const collected = await message.awaitReactions({ filter: () => true, maxUsers: 2 })
			const emote = collected.filter(emote => emote.count > 1).entries().next().value[0]
			let path = ''
			
			if (emote === '1⃣') {
				['upcoming_movies', 'trending_movies', 'trending_tv', 'trending_games', 'trending_npm', 'trending_pypi', 'trending_github'].forEach(item => {
					const command = new sqs.SendMessageCommand({
						MessageBody: `/v1/${item}@${process.env.KEY}`,
						QueueUrl: 'https://sqs.us-east-1.amazonaws.com/919759177803/scraper'
					})
					promises.push(new Promise((resolve, reject) => {
						clientSQS.send(command).then(() => resolve(item)).catch(() => reject(item))
					}))
				})
				await Promise.allSettled(promises)
					.then(results => results.forEach(result => {
						if (result?.status == 'fulfilled') {
							channel.send(`✅ sent a update request to ${result?.value}`)
						} else {
							channel.send(`😨 something went wrong sending update for ${result?.value}`)
						}
					}))
					.finally(() => channel.send('🐶please allow up to 5 minutes for the database to be updated'))
			} else if (emote === '2⃣') {
				path = 'upcoming_movies'
			} else if (emote === '3⃣') {
				path = 'trending_movies'
			} else if (emote === '4⃣') {
				path = 'trending_tv'
			} else if (emote === '5⃣') {
				path = 'trending_games'
			} else if (emote === '6⃣') {
				path = 'trending_npm'
			} else if (emote === '7⃣') {
				path = 'trending_pypi'
			} else if (emote === '8⃣') {
				path = 'trending_github'
			} else if (emote === '9️⃣') {
				const res = await query('SELECT updated_at FROM trending_pypi LIMIT 1')
				channel.send(`Last database update happened at ${res[0].updated_at}`)
			}
			if (path) {
				const command = new sqs.SendMessageCommand({
					MessageBody: `/v1/${path}@${process.env.KEY}`,
					QueueUrl: 'https://sqs.us-east-1.amazonaws.com/919759177803/scraper'
				})
				clientSQS.send(command)
					.then(() => channel.send(`✅ sent a update request to ${path}`))
					.catch(() => channel.send(`😨 something went wrong sending update for ${path}`))
			}
			message.react('🛑')
		}
	}
	if (msg.content === '!upcoming-movies') {
    const res = await query('SELECT * FROM upcoming_movies LIMIT 25')
		const updatedAt = new Date(res[0].updated_at).toDateString()
		const channel = client.channels.cache.get(process.env.MOVIES_ID)
		const parsedMovies = res.map(movie => ({...movie, release: (movie.release).toUTCString().slice(0, 11)}))
    const fields = []
		const groupedByDate = groupBy(parsedMovies, 'release')

    for (const [date, movies] of Object.entries(groupedByDate)) {
			// console.log('date', date)
			// console.log('size of movies for this date', movies.length)
			let value = ''
			for (const movie of movies) {
				// console.log('looping over', movie)
				value += movie.title + '\n'
			}
			fields.push({ name: date, value })
    }
    let monthEmbed = new Discord.EmbedBuilder() // embed max 6000
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
		const res = await query('SELECT * FROM trending_movies LIMIT 25')
		const date = new Date(res[0].updated_at).toDateString()
		const reducedArr = reduce(res, 25)
		const channel = client.channels.cache.get(process.env.MOVIES_ID)
		for (let j = 0; j < 1; j++) {
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
			const monthEmbed = new Discord.EmbedBuilder() // embed max 6000
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
	if (msg.content === '!tv') {
		// TODO: args https://discordjs.guide/creating-your-bot/commands-with-user-input.html#basic-arguments
		// const args = msg.content.slice(12).trim().split(' ')
		// console.log('args', args)
		const res = await query('SELECT * FROM trending_tv LIMIT 25')
		const date = new Date(res[0].updated_at).toDateString()
		const reducedArr = reduce(res, 25)
		const channel = client.channels.cache.get(process.env.TV_ID)
		for (let j = 0; j < 1; j++) {
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
			// console.log(fields)
			const monthEmbed = new Discord.EmbedBuilder() // embed max 6000
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