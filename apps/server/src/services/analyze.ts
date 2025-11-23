import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from '@google/genai'
import { Request } from 'express'
import 'dotenv/config'
import { analyzedVoiceResponseJsonSchema } from '../types/analyze.js'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set')
}

const genAI = new GoogleGenAI({ apiKey })

export async function analyzeVoiceService(req: Request) {
  if (!req.file) {
    throw new Error('No file uploaded.')
  }

  const uploadResponse = await genAI.files.upload({
    file: req.file.path,
    config: { mimeType: req.file.mimetype },
  })

  if (!uploadResponse.uri || !uploadResponse.mimeType) {
    throw new Error('File upload failed, URI or mimeType is missing.')
  }

  const currentDate = new Date().toISOString()

  const result = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: createUserContent([
      createPartFromUri(uploadResponse.uri, uploadResponse.mimeType),
      `Analyze this audio file and provide vocal tone analysis, improvement tips, and suggested exercises. Also, create a 7-day training timeline (today's date is ${currentDate}) for the user to follow. Fill in the response JSON accordingly.`,
    ]),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: analyzedVoiceResponseJsonSchema,
      maxOutputTokens: 16000,
    },
  })

  const text = result.text

  return JSON.parse(result.text || '')
}
