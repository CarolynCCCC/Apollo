import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const source = path.resolve(__dirname, '../../apollo-constants/constant')
const destination = path.resolve(__dirname, '../src/constant')

fs.cpSync(source, destination, { recursive: true })
