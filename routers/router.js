import cheerio from 'cheerio'
import express from 'express'
import htmlHelper from '../helpers/html.helper.js'

const router = express.Router()

router.get('/search/:expression', async (req, res) => {
  let results = []
  const { expression } = req.params
  const html = await htmlHelper.getHtml(
    `https://www.metacritic.com/search/movie/${expression}/results`
  )

  const html2 = await htmlHelper.getHtml(
    `https://www.metacritic.com/search/tv/${expression}/results`
  )

  let $ = cheerio.load(html)
  $('.product_title').each(function (i, e) {
    const title = $(e).children().text().trim()
    const url = `https://www.metacritic.com/${$(e).children().attr('href')}`
    const year = parseInt($(e).siblings('p').text().trim().substring(7, 12))
    const name = url.substring(url.lastIndexOf('/') + 1, url.length)
    const type = 'movie'
    const imageUrl = $(e)
      .parent()
      .parent()
      .siblings('div')
      .children()
      .attr('src')
    results = [...results, { title, url, year, name, type, imageUrl }]
  })

  $ = cheerio.load(html2)
  $('.product_title').each(function (i, e) {
    const title = $(e).children().text().trim()
    const url = `https://www.metacritic.com/${$(e).children().attr('href')}`
    const year = parseInt($(e).siblings('p').text().trim().substring(9, 14))
    const name = url.substring(url.lastIndexOf('/') + 1, url.length)
    const type = 'tv'
    const imageUrl = $(e)
      .parent()
      .parent()
      .siblings('div')
      .children()
      .attr('src')
    results = [...results, { title, url, year, name, type, imageUrl }]
  })

  res.send(results)
})

router.get('/score/:type/:title', async (req, res) => {
  let result = {
    criticCount: 0,
    userCount: 0,
  }
  const { title, type } = req.params
  const html = await htmlHelper.getHtml(
    `https://www.metacritic.com/${type}/${title}`
  )
  const $ = cheerio.load(html)
  $('.metascore_anchor').each(function (i, e) {
    if (i == 0) {
      const criticScore = parseInt($(e).children().text())
      result = { ...result, criticScore }
    }
    if (i == 1) {
      const userScore = parseFloat($(e).children().text()) * 10
      result = { ...result, userScore }
    }
  })
  $('.based_on').each(function (i, e) {
    if (i == 0) {
      const criticCount = parseInt(
        $(e)
          .text()
          .substring(9, $(e).text().length - 15)
      )
      result = { ...result, criticCount }
    }
    if (i == 1) {
      const userCount = parseInt(
        $(e)
          .text()
          .substring(9, $(e).text().length - 6)
      )
      result = { ...result, userCount }
    }
  })
  result = { ...result, title: $('.product_page_title').children('h1').text() }
  if (type == 'movie') {
    result = { ...result, year: parseInt($('.release_year').text()) }
  } else {
    let year = $('.release_date').children().text()
    result = {
      ...result,
      year: parseInt(year.substring(year.length - 4, year.length)),
    }
  }
  result = { ...result, imageUrl: $('.summary_img').attr('src') }
  if (!result.criticScore) result.criticScore = -1
  if (!result.userScore) result.userScore = -1
  res.json(result)
})

router.get('/reviews/:movie', async (req, res) => {
  let results = []
  const { movie } = req.params
  const html = await htmlHelper.getHtml(
    `https://www.metacritic.com/movie/${movie}`
  )
  const $ = cheerio.load(html)
  $('.critic_reviews2')
    .children()
    .each(function (i, e) {
      const score = parseInt(
        $(e)
          .children('.head_wrap')
          .children('.score_wrap')
          .children()
          .text()
          .trim()
      )
      const author = $(e)
        .children('.head_wrap')
        .children('.pub_wrap')
        .children('.author')
        .text()
        .trim()
      const source = $(e)
        .children('.head_wrap')
        .children('.pub_wrap')
        .children('.source')
        .children()
        .children()
        .attr('title')
      const review = $(e)
        .children('.summary_wrap')
        .children()
        .children('.no_hover')
        .text()
        .trim()
      results = [...results, { score, author, source, review }]
    })
  res.json(results)
})

export default router
