'use strict'
const jsdom = require('jsdom')
const axios = require('axios')
const pg = require('pg')
const format = require('pg-format')

const { JSDOM } = jsdom

module.exports.api = async event => {
  let response = { 
    statusCode: 200, 
    body: 'default',
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*"
    },
  }
  const db = new pg.Client({ 
    connectionString: process.env.PG_URI,
    ssl: { rejectUnauthorized: false }
  })
  try {
    const path = event.pathParameters?.id
    const creationKey = event.queryStringParameters?.key

    if (creationKey) { // write
      if (creationKey !== process.env.KEY) throw 'Wrong key'

      if (path === 'trending_github') {
        if (!process.env.GIT_TOKEN) throw 'undefined GIT_TOKEN env var'
        response.body = await githubTrends()
      } else if (path === 'upcoming_movies') {
        response.body = await getUpComingMovies()
        console.log('body', response.body)
      } else if (path === 'trending_movies') {
        response.body = await getTrendingMovie()
      } else if (path === 'trending_tv') {
        response.body = await getTrendingTV()
      } else if (path === 'upcoming_games') {
        response.body = await upcomingGames()
      } else if (path === 'trending_npm_1') {
        response.body = await getNpmTrend()
      } else if (path === 'trending_npm_2') {
        response.body = await getNpmTrendAlt()
        console.log('raw data', response.body)
      } else if (path === 'get_build') {
        response.body = process.env.BUILD_ID
      } else {
        throw `BUILD: ${process.env.BUILD_ID} |
  Use one of the following api paths:
  /trending_github
  /upcoming_movies
  /trending_movies
  /trending_tv
  /upcoming_games
  /trending_npm_1
  /trending_npm_2`
      }
  
      if (response.body && (path !== 'get_build')) { // write
        console.log('save to db')
        await db.connect()
        let { deleteSQL, insertSQL } = generateSQL(path, response.body)
        console.log('SQL DUMP', deleteSQL)
        await db.query(deleteSQL)
        console.log('insert sql!!!', insertSQL)
        const res = await db.query(insertSQL).then(res => res.rowCount)
        console.log('db query res', res)
      }
    } else { // read
      console.log('read request')
      await db.connect()
      const readSQL = generateSQL(path, null, true)
      console.log('read sql =',readSQL)
      if (!readSQL) throw `BUILD: ${process.env.BUILD_ID} |
Use one of the following api paths:
/trending_github
/upcoming_movies
/trending_movies
/trending_tv
/upcoming_games
/trending_npm_1
/trending_npm_2`
      response.body = await db.query(readSQL).then(res => res.rows)
      // console.log('rows', rows)
    }
    response.body = JSON.stringify(response.body, null, 2)
  } catch (err) {
    console.log(err)
    if (typeof err === 'string') {
      response = { statusCode: 400, body: err.split('\n').join(' ') }
    } else {
      response = { statusCode: 500, body: (err.message || err)}
    }
  } finally { 
    await db.end()
    return response
  }
}

function toArr(rawData) {
  return rawData.map(obj => {
    return Object.keys(obj).map(key => { 
      return obj[key]
    })
  })
}

function generateSQL(path, data, isRead) {
  let deleteSQL = null
  let insertSQL = null
  let readSQL = null
  if (path === 'trending_github') {
    deleteSQL = 'DELETE FROM trending_github'
    insertSQL = 'trending_github(name, href, description, stars)'
    readSQL = 'SELECT * FROM trending_github'
  } else if (path === 'trending_npm_1') {
    deleteSQL = 'DELETE FROM trending_npm_1'
    insertSQL = 'trending_npm_1(subject, page, rank, title, description)'
    readSQL = 'SELECT * FROM trending_npm_1'
  } else if (path === 'trending_movies') {
    deleteSQL = 'DELETE FROM trending_movies'
    insertSQL = 'trending_movies(link, img, title, year, rank, velocity, rating)'
    readSQL = 'SELECT * FROM trending_movies'
  } else if (path === 'trending_npm_2') {
    deleteSQL = 'DELETE FROM trending_npm_2'
    insertSQL = 'trending_npm_2(rank, page, link, name, description, stars)'
    readSQL = 'SELECT * FROM trending_npm_2'
  } else if (path === 'trending_tv') {
    deleteSQL = 'DELETE FROM trending_tv'
    insertSQL = 'trending_tv(link, img, title, rank, velocity, rating)'
    readSQL = 'SELECT * FROM trending_tv'
  } else if (path === 'upcoming_games') {
    deleteSQL = 'DELETE FROM upcoming_games'
    insertSQL = 'upcoming_games(link, img, name, release)'
    readSQL = 'SELECT * FROM upcoming_games'
  } else if (path === 'upcoming_movies') {
    if (isRead) return 'SELECT * FROM upcoming_movies'
    return {
      deleteSQL: 'DELETE FROM upcoming_movies',
      insertSQL: format(`INSERT INTO upcoming_movies(raw_json) VALUES(%L)`, [JSON.stringify(data)])
    }
  } else return
  if (isRead) return readSQL
  return {
    deleteSQL,
    insertSQL: format(`INSERT INTO ${insertSQL} VALUES %L`, toArr(data))
  }
}

async function githubTrends() {
  const LANGUAGES = ["JavaScript", "Python", "Shell"]
  const TOKEN = process.env.GIT_TOKEN;
  const allData = await axios.get('https://api.github.com/search/repositories?q=stars:>0&sort=stars&per_page=100', 
      { Headers: { Authorization: TOKEN } })
    .then(res => res.data)
    .catch(console.log)
  for (const language of LANGUAGES) {
    const langData = await axios.get(`https://api.github.com/search/repositories?q=language:${language}&stars:>0&sort=stars&per_page=100`, 
        { Headers: { Authorization: TOKEN } })
      .then(res => res.data)
      .catch(console.log)
    const relevantLangData = langData.items.map(repo => ({
      name: repo.name,
      href: repo.html_url,
      description: repo.description?.substring(0, 300) || '',
      stars: repo.stargazers_count,
      language
    }))
    console.log(relevantLangData)
  }
  const relevantAllData = allData.items.map(repo => ({
    name: repo.name,
    href: repo.html_url,
    description: repo.description.substring(0, 300),
    stars: repo.stargazers_count
  }))
  return relevantAllData
}

async function getUpComingMovies() {
  const html = await axios.get('https://www.imdb.com/calendar')
    .then(res => res.data)
    .catch(() => console.log('bad request'))
  const dom = new JSDOM(html)
  console.log('')
  const main = dom.window.document.querySelector("#main")?.innerHTML
  const main2 = dom.window.document.getElementsByTagName("main")?.innerHTML
  // document[0]
  const data = []
  // console.log('html', html)
  console.log('main', main)
  console.log('main2', main2)
  if (!main) return

  let lastDate = null
  await Promise.all(main.split('\n').map(async line => {
    if (line) { // only read lines with content
      let obj = {}
      if (line.includes('<h4>')) { // date
        // date = line.replace(/<[^>]+>/g, '').trim().replace(/ /g, '_')
        // const dateArr = line.replace(/<[^>]+>/g, '').trim().split(' ')
        // const date = Date.parse(`${dateArr[0]} ${dateArr[1]} ${dateArr[2]}`)
        lastDate = line.replace(/<[^>]+>/g, '').trim()
      } else if (line.includes('<a')) { // movie
        obj.date = lastDate ? lastDate : 'None'

        // const lastDate = Object.keys(data)[Object.keys(data).length - 1]
        const partial = line.split('>')[1]
        obj.title = partial.substring(0, partial.length - 3)
        console.log('loop over', obj.title, '| last date was', lastDate)

        obj.href = 'https://www.imdb.com' + line.split('\"')[1]
        // const img = await getImage(title)
        // let img = ''

        // TODO: solve issue with stalled requests 
        // const query = encodeURIComponent(title).replace(/%20/g, "+")
        // console.log('fetching thumbnail for', obj.title, '...')
        // const htmlImg = await axios.get(`https://m.imdb.com/find?q=${query}`)
        //   .then(res => res.data)
        //   .catch(() => console.log('bad img req'))
        // if (htmlImg) {
        //   const domImg = new JSDOM(htmlImg)
        //   const htmlFragment = domImg.window.document.querySelector(".container").innerHTML
        //   const page = htmlFragment.split('\n')
        //   page.map(tag => {
        //     if (!img && tag.includes('<img ')) {
        //       img = tag
        //       // console.log('+ img for', title)
        //     }
        //   })
        //   img = img.split('\"')[1]
        // } else {
        //   console.log('a bad req was detected')
        // }

        console.log('+', obj.title)
        // console.log('DEBUG:', { title, href, img })
        
        // { title, href, date: date }
        // data[lastDate] = arr
      }
      if (obj.title) data.push(obj)
    }
  }))
  console.log('data', data)
  return data
}

async function getTrendingTV() {
  const html = await axios.get('https://www.imdb.com/chart/tvmeter')
    .then(res => res.data)
    .catch(console.log)
  const dom = new JSDOM(html)
  const list = dom.window.document.querySelector(".lister-list")
  const data = []
  for (const row of list.getElementsByTagName('tr')) {
    const show = {}
    for (const node of row.childNodes) {
      if (node.className === 'posterColumn') {
        show.link = 'https://imdb.com' + node.getElementsByTagName('a').item(0).getAttribute('href')
        show.img = node.getElementsByTagName('img').item(0).getAttribute('src')
      } else if (node.className === 'titleColumn') {
        show.title = node.getElementsByTagName('a').item(0).textContent
        const el = node.getElementsByTagName('div').item(0).querySelector('.secondaryInfo')?.textContent
        let velocity = 0
        if (el) {
          velocity = Number(el.split('\n')[2].slice(0, -1).match(/\d+/g).join(''))
        }
        let rank = node.getElementsByTagName('div').item(0).childNodes[0].textContent.trim()
        if (rank.includes('no change')) {
          rank = rank.match(/\d+/g).toString() // remove (no change) text
          velocity = 0
        }

        if (node.getElementsByTagName('div').item(0).childNodes[1]?.childNodes[1]?.className.includes('down')) {
          velocity *= -1 // use negative to represent downward velocity
        }
        show.rank = rank
        show.velocity = velocity
      } else if (node.className?.includes('imdbRating')) {
        show.rating = node.textContent.trim()
      }
    }
    console.log('+', show)
    data.push(show)
  }
  return data
}

async function getTrendingMovie() {
  const html = await axios.get('https://www.imdb.com/chart/moviemeter')
    .then(res => res.data)
    .catch(console.log)
  const dom = new JSDOM(html)
  const list = dom.window.document.querySelector(".lister-list")
  const data = []
  for (const row of list.getElementsByTagName('tr')) {
    const movie = {}
    for (const node of row.childNodes) {
      if (node.className === 'posterColumn') {
        movie.link = 'https://imdb.com' + node.getElementsByTagName('a').item(0).getAttribute('href')
        movie.img = node.getElementsByTagName('img').item(0).getAttribute('src')
      } else if (node.className === 'titleColumn') {
        movie.title = node.getElementsByTagName('a').item(0).textContent
        movie.year = node.getElementsByTagName('span').item(0).textContent.split('').slice(1, 5).join('')
        const el = node.getElementsByTagName('div').item(0).querySelector('.secondaryInfo')?.textContent
        let velocity = 0
        if (el) {
          velocity = Number(el.split('\n')[2].slice(0, -1).match(/\d+/g).join(''))
        }
        let rank = node.getElementsByTagName('div').item(0).childNodes[0].textContent.trim()
        if (rank.includes('no change')) {
          rank = rank.match(/\d+/g).toString() // remove (no change) text
          velocity = 0
        }

        if (node.getElementsByTagName('div').item(0).childNodes[1]?.childNodes[1]?.className.includes('down')) {
          velocity *= -1 // use negative to represent downward velocity
        }
        movie.rank = rank
        movie.velocity = velocity
      } else if (node.className?.includes('imdbRating')) {
        movie.rating = node.textContent.trim()
      }
    }
    console.log('+', movie)
    data.push(movie)
  }
  return data
}

async function upcomingGames() {
  const html = await axios.get('https://store.steampowered.com/search/?category1=998&os=win&filter=popularcomingsoon')
    .then(res => res.data)
    .catch(console.log)
  const dom = new JSDOM(html)
  const list = dom.window.document.querySelector("#search_resultsRows")
  const data = []
  for (const row of list.getElementsByTagName('a')) {
    const game = {}
    game.link = row.getAttribute('href')
    for (const node of row.childNodes) {
      if (node.className?.includes('search_capsule')) {
        game.img = node.childNodes[0].getAttribute('src')
      } else if (node.className?.includes('responsive_search_name_combined')) { // will select div class="responsive_search_name_combined"
        const divs = node.getElementsByTagName('div')
        for (const div of divs) {
          if (div.className.includes('search_name')) {
            game.name = div.getElementsByTagName('span').item(0).textContent.trim()
          }
          if (div.className.includes('search_released')) {
            game.release = div.textContent.trim()
          }
        }
      }
    }
    console.log('+', game)
    data.push(game)
  }
  return data
}

async function getNpmTrend() {
  const keywords = [
    'backend',
    'front-end',
    'cli',
    'framework',
  ]
  const data = []
  for (let page = 0; page < 3; page++) {
    for (const subject of keywords) {
      let rank = 0
      console.log('\n' +subject, '| page', page)
      console.log('scraping', `https://www.npmjs.com/search?ranking=popularity&page=${page}&q=keywords%3A${subject}`)
      const html = await axios.get(`https://www.npmjs.com/search?ranking=popularity&page=${page}&q=keywords%3A${subject}`)
        .then(res => res.data)
        .catch(console.log) //ECONNRESET
      const dom = new JSDOM(html)
      const list = dom.window.document.getElementsByTagName("main").item(0)?.childNodes[2]?.childNodes[1]
      if (!list) {
        console.log('no results found')
        return
      }
      for (const result of list.childNodes) { // section
        if (result.firstChild.firstChild.firstChild.childNodes.length === 2) {
          const item = { subject, page, rank }
          item.title = result.firstChild.firstChild.firstChild.lastChild.textContent
          // console.log('+', item.title)
          item.description = 'None' // some npm have no descrition eg. @devoralime/server
          for (const node of result.firstChild.childNodes) { // all nodes inside 1st div of results

            if (item.title === '@devoralime/server') {
              console.log('raw node', node)
              console.log('node text', node.textContent)
              console.log('node name', node.nodeName)
            }
            if (node.nodeName === 'P') { // description
              item.description = node.textContent
            }
          }
          rank++
          data.push(item)
        }
      }
      console.log('finished', subject, 'page', page, 'with', data.length, 'items')
    }
  }
  // console.log(data)
  return data
}

async function getNpmTrendAlt() {
  const data = []
  for (let page = 1; page < 11; page++) { // takes 26s, close to apigateway max of 29
    console.log('scraping', `https://libraries.io/search?languages=JavaScript&order=desc&page=${page}&platforms=npm`)
    const html = await axios.get(`https://libraries.io/search?languages=JavaScript&order=desc&page=${page}&platforms=npm`)
      .then(res => res.data)
      .catch(() => console.log('req err'))
    const dom = new JSDOM(html)
    const nodes = dom.window.document.querySelector('.col-sm-8')?.childNodes
    if (!nodes) {
      console.log('no results found')
      return
    }
    let rank = 0
    for (let i = 0; i < 66; i++) {
      if (i < 6 || nodes[i].nodeName === '#text') {
      } else {
        const item = { rank: rank + ((page - 1) * 30), page: page - 1 }
        // console.log('\nNew Result')
        let index = 0
        for (const node of nodes[i].childNodes) {
          // console.log('-->', node.nodeName)
          if (node.nodeName === 'H5') {
            item.link = 'npm.io/package/' + node.childNodes[1]?.getAttribute('href').slice(5)
            item.name = node.textContent.trim()
          } else if (node.nodeName === 'DIV') {
            item.description = node.firstChild?.textContent.trim()
          } else if (node.nodeName === 'SMALL') {
            item.stars = node.childNodes[2].textContent.split('\n')[1].trim().slice(2)
            rank++
            // console.log('item', item)
          }
          index++
        }
        data.push(item)
      }
    }
    console.log('finished page', page, 'with', rank, 'items, totalling at', data.length)
  }
  return data
}