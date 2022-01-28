import express from 'express'
import router from './routers/router.js'

const app = express()

app.use('/', router)

app.listen(80)
