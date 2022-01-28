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
  const $ = cheerio.load(html)
  $('.product_title').each(function (i, e) {
    const title = $(e).children().text().trim()
    const url = `https://www.metacritic.com/${$(e).children().attr('href')}`
    const year = parseInt($(e).siblings('p').text().trim().substring(7, 12))
    const movieName = url.substring(url.lastIndexOf('/') + 1, url.length)
    results = [...results, { title, url, year, movieName }]
  })
  res.send(results)
})

router.get('/score/:movie', async (req, res) => {
  let result = {}
  const { movie } = req.params
  const html = await htmlHelper.getHtml(
    `https://www.metacritic.com/movie/${movie}`
  )
  const $ = cheerio.load(html)
  $('.metascore_anchor').each(function (i, e) {
    if (i == 0) {
      const criticScore = parseInt($(e).children().text())
      result = { ...result, criticScore }
    }
    if (i == 1) {
      const userScore = parseFloat($(e).children().text())
      result = { ...result, userScore }
      res.json(result)
    }
  })
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
