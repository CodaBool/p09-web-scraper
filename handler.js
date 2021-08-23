const jsdom = require('jsdom')
const axios = require('axios')
const mongoose = require('mongoose')

const { JSDOM } = jsdom

module.exports.api = async event => {
  let response = { statusCode: 200, body: 'default' }
  try {
    const path = 'get-build'
    if (path === 'trending-github') {
      response.body = 'ok then 1'
      // console.log('got data here')
    } else if (path === 'upcoming-movies') {
      response.body = 'ok then 2'
    } else if (path === 'trending-movies') {
      response.body = 'ok then 3'
    } else if (path === 'trending-tv') {
      response.body = 'ok then 4'
    } else if (path === 'upcoming-games') {
      response.body = 'ok then 5'
    } else if (path === 'trending-npm-1') {
      response.body = 'ok then 6'
    } else if (path === 'trending-npm-2') {
      response.body = 'ok then 7'
    } else if (path === 'get-build') {
      response.body = 'ok then 8'
    } else {
      console.log('IN ELSE')
    }

    response.body = 'wowee end'
  } catch (err) {
    console.log(err)
    response = { statusCode: 500, body: 'an error' }
  } finally {
    return response
  }
}

// async function saveData(collection, data) {
//   const connection = await mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useCreateIndex: true
//   })
//   try {
//     const quickSchema = new mongoose.Schema({}, { strict: false, timestamps: true, collection })
//     const Model = mongoose.model(collection, quickSchema)
//     const doc = new Model(data)
//     await doc.save()
//   } catch (error) {
//     console.log(error)
//   } finally {
//     connection?.disconnect()
//   }
// }

// async function githubTrends() {
//   const LANGUAGES = ["JavaScript", "Python", "Shell"]
//   const TOKEN = process.env.GIT_TOKEN;
//   const allData = await axios.get('https://api.github.com/search/repositories?q=stars:>0&sort=stars&per_page=100', 
//       { Headers: { Authorization: TOKEN } })
//     .then(res => res.data)
//     .catch(console.log)
//   for (const language of LANGUAGES) {
//     const langData = await axios.get(`https://api.github.com/search/repositories?q=language:${language}&stars:>0&sort=stars&per_page=100`, 
//         { Headers: { Authorization: TOKEN } })
//       .then(res => res.data)
//       .catch(console.log)
//     const relevantLangData = langData.items.map(repo => ({
//       name: repo.name,
//       href: repo.html_url,
//       description: repo.description?.substring(0, 300) || '',
//       stars: repo.stargazers_count,
//       language
//     }))
//     console.log(relevantLangData)
//   }
//   const relevantAllData = allData.items.map(repo => ({
//     name: repo.name,
//     href: repo.html_url,
//     description: repo.description.substring(0, 300),
//     stars: repo.stargazers_count
//   }))
//   return relevantAllData
// }

// async function getUpComingMovies() {
//   const html = await axios.get('https://www.imdb.com/calendar')
//     .then(res => res.data)
//     .catch(() => console.log('bad request'))
//   const dom = new JSDOM(html)
//   const main = dom.window.document.querySelector("#main")?.innerHTML
//   const data = {}
//   if (!main) return

//   await Promise.all(main.split('\n').map(async line => {
//     if (line) { // only read lines with content
//       if (line.includes('<h4>')) { // date
//         const text = line.replace(/<[^>]+>/g, '').trim().replace(/ /g, '_')
//         data[text] = []
//       } else if (line.includes('<a')) { // movie
//         const lastDate = Object.keys(data)[Object.keys(data).length - 1]
//         const partial = line.split('>')[1]
//         const title = partial.substring(0, partial.length - 3);
//         const href = 'https://www.imdb.com' + line.split('\"')[1]

//         // const img = await getImage(title)
//         let img = ''

//         // TODO: solve issue with stalled requests 

//         // const query = encodeURIComponent(title).replace(/%20/g, "+")
//         // console.log('fetching thumbnail for', title, '...')
//         // const htmlImg = await axios.get(`https://m.imdb.com/find?q=${query}`)
//         //   .then(res => res.data)
//         //   .catch(() => console.log('bad img req'))
//         // if (htmlImg) {
//         //   const domImg = new JSDOM(htmlImg)
//         //   const htmlFragment = domImg.window.document.querySelector(".container").innerHTML
//         //   const page = htmlFragment.split('\n')
//         //   page.map(tag => {
//         //     if (!img && tag.includes('<img ')) {
//         //       img = tag
//         //       // console.log('+ img for', title)
//         //     }
//         //   })
//         //   img = img.split('\"')[1]
//         // } else {
//         //   console.log('a bad req was detected')
//         // }

//         const arr = data[lastDate]
//         console.log('+', title, '| img =', !!img)
//         // console.log('DEBUG:', { title, href, img })
//         arr.push({ title, href, img })
//         data[lastDate] = arr
//       }
//     }
//   }))
//   return data
// }

// async function getTrendingTV() {
//   const html = await axios.get('https://www.imdb.com/chart/tvmeter')
//     .then(res => res.data)
//     .catch(console.log)
//   const dom = new JSDOM(html)
//   const list = dom.window.document.querySelector(".lister-list")
//   const data = []
//   for (const row of list.getElementsByTagName('tr')) {
//     const show = {}
//     for (const node of row.childNodes) {
//       if (node.className === 'posterColumn') {
//         show.link = 'https://imdb.com' + node.getElementsByTagName('a').item(0).getAttribute('href')
//         show.img = node.getElementsByTagName('img').item(0).getAttribute('src')
//       } else if (node.className === 'titleColumn') {
//         show.title = node.getElementsByTagName('a').item(0).textContent
//         const el = node.getElementsByTagName('div').item(0).querySelector('.secondaryInfo')?.textContent
//         let velocity = 0
//         if (el) {
//           velocity = Number(el.split('\n')[2].slice(0, -1).match(/\d+/g).join(''))
//         }
//         let rank = node.getElementsByTagName('div').item(0).childNodes[0].textContent.trim()
//         if (rank.includes('no change')) {
//           rank = rank.match(/\d+/g).toString() // remove (no change) text
//           velocity = 0
//         }

//         if (node.getElementsByTagName('div').item(0).childNodes[1]?.childNodes[1]?.className.includes('down')) {
//           velocity *= -1 // use negative to represent downward velocity
//         }
//         show.rank = rank
//         show.velocity = velocity
//       } else if (node.className?.includes('imdbRating')) {
//         show.rating = node.textContent.trim()
//       }
//     }
//     console.log('+', show)
//     data.push(show)
//   }
//   return data
// }

// async function getTrendingMovie() {
//   const html = await axios.get('https://www.imdb.com/chart/moviemeter')
//     .then(res => res.data)
//     .catch(console.log)
//   const dom = new JSDOM(html)
//   const list = dom.window.document.querySelector(".lister-list")
//   const data = []
//   for (const row of list.getElementsByTagName('tr')) {
//     const movie = {}
//     for (const node of row.childNodes) {
//       if (node.className === 'posterColumn') {
//         movie.link = 'https://imdb.com' + node.getElementsByTagName('a').item(0).getAttribute('href')
//         movie.img = node.getElementsByTagName('img').item(0).getAttribute('src')
//       } else if (node.className === 'titleColumn') {
//         movie.title = node.getElementsByTagName('a').item(0).textContent
//         movie.year = node.getElementsByTagName('span').item(0).textContent.split('').slice(1, 5).join('')
//         const el = node.getElementsByTagName('div').item(0).querySelector('.secondaryInfo')?.textContent
//         let velocity = 0
//         if (el) {
//           velocity = Number(el.split('\n')[2].slice(0, -1).match(/\d+/g).join(''))
//         }
//         let rank = node.getElementsByTagName('div').item(0).childNodes[0].textContent.trim()
//         if (rank.includes('no change')) {
//           rank = rank.match(/\d+/g).toString() // remove (no change) text
//           velocity = 0
//         }

//         if (node.getElementsByTagName('div').item(0).childNodes[1]?.childNodes[1]?.className.includes('down')) {
//           velocity *= -1 // use negative to represent downward velocity
//         }
//         movie.rank = rank
//         movie.velocity = velocity
//       } else if (node.className?.includes('imdbRating')) {
//         movie.rating = node.textContent.trim()
//       }
//     }
//     console.log('+', movie)
//     data.push(movie)
//   }
//   return data
// }

// async function upcomingGames() {
//   const html = await axios.get('https://store.steampowered.com/search/?category1=998&os=win&filter=popularcomingsoon')
//     .then(res => res.data)
//     .catch(console.log)
//   const dom = new JSDOM(html)
//   const list = dom.window.document.querySelector("#search_resultsRows")
//   const data = []
//   for (const row of list.getElementsByTagName('a')) {
//     const game = {}
//     game.link = row.getAttribute('href')
//     for (const node of row.childNodes) {
//       if (node.className?.includes('search_capsule')) {
//         game.img = node.childNodes[0].getAttribute('src')
//       } else if (node.className?.includes('responsive_search_name_combined')) { // will select div class="responsive_search_name_combined"
//         const divs = node.getElementsByTagName('div')
//         for (const div of divs) {
//           if (div.className.includes('search_name')) {
//             game.name = div.getElementsByTagName('span').item(0).textContent.trim()
//           }
//           if (div.className.includes('search_released')) {
//             game.release = div.textContent.trim()
//           }
//         }
//       }
//     }
//     console.log('+', game)
//     data.push(game)
//   }
//   return data
// }

// async function getNpmTrend() {
//   const keywords = [
//     'backend',
//     'front-end',
//     'cli',
//     'framework',
//   ]
//   const data = []
//   for (let page = 0; page < 3; page++) {
//     for (const subject of keywords) {
//       let rank = 0
//       console.log('\n' +subject, '| page', page)
//       console.log('scraping', `https://www.npmjs.com/search?ranking=popularity&page=${page}&q=keywords%3A${subject}`)
//       const html = await axios.get(`https://www.npmjs.com/search?ranking=popularity&page=${page}&q=keywords%3A${subject}`)
//         .then(res => res.data)
//         .catch(console.log) //ECONNRESET
//       const dom = new JSDOM(html)
//       const list = dom.window.document.getElementsByTagName("main").item(0)?.childNodes[1]?.childNodes[1]
//       if (!list) {
//         console.log('no results found')
//         return
//       }
//       for (const result of list.childNodes) { // section
//         if (result.firstChild.firstChild.firstChild.childNodes.length === 2) {
//           const item = { subject, page, rank }
//           item.title = result.firstChild.firstChild.firstChild.lastChild.textContent
//           // console.log('+', item.title)
//           for (const node of result.firstChild.childNodes) { // all nodes inside 1st div of results
//             if (node.nodeName === 'P') { // description
//               item.description = node.textContent
//             }
//           }
//           rank++
//           data.push(item)
//         }
//       }
//       console.log('finished', subject, 'page', page, 'with', data.length, 'items')
//     }
//   }
//   // console.log(data)
//   return data
// }

// async function getNpmTrendAlt() {
//   const data = []
//   for (let page = 1; page < 11; page++) { // takes 26s, close to apigateway max of 29
//     console.log('scraping', `https://libraries.io/search?languages=JavaScript&order=desc&page=${page}&platforms=npm`)
//     const html = await axios.get(`https://libraries.io/search?languages=JavaScript&order=desc&page=${page}&platforms=npm`)
//       .then(res => res.data)
//       .catch(() => console.log('req err'))
//     const dom = new JSDOM(html)
//     const nodes = dom.window.document.querySelector('.col-sm-8')?.childNodes
//     if (!nodes) {
//       console.log('no results found')
//       return
//     }
//     let rank = 0
//     for (let i = 0; i < 66; i++) {
//       if (i < 6 || nodes[i].nodeName === '#text') {
//       } else {
//         const item = { rank: rank + ((page - 1) * 30), page: page - 1 }
//         // console.log('\nNew Result')
//         let index = 0
//         for (const node of nodes[i].childNodes) {
//           // console.log('-->', node.nodeName)
//           if (node.nodeName === 'H5') {
//             item.link = 'npm.io/package/' + node.childNodes[1]?.getAttribute('href').slice(5)
//             item.name = node.textContent.trim()
//           } else if (node.nodeName === 'DIV') {
//             item.description = node.firstChild?.textContent.trim()
//           } else if (node.nodeName === 'SMALL') {
//             item.stars = node.childNodes[2].textContent.split('\n')[1].trim().slice(2)
//             rank++
//             // console.log('item', item)
//           }
//           index++
//         }
//         data.push(item)
//       }
//     }
//     console.log('finished page', page, 'with', rank, 'items, totalling at', data.length)
//   }
//   return data
// }