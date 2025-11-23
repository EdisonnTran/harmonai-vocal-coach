import express from 'express'
import analyze from './routes/analyze.js'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

const app = express()

const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

app.use(express.json())
app.use(cors())

app.use('/analyze', analyze)

export default app
