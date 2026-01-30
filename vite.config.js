import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables for the middleware
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      fastRefresh: process.env.NODE_ENV !== 'test'
    }),
    {
      name: 'api-serverless-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url.startsWith('/api/')) {
            const url = new URL(req.url, `http://${req.headers.host}`)
            const apiPath = url.pathname.replace('/api/', '')
            const filePath = path.resolve(__dirname, 'api', `${apiPath}.js`)

            if (fs.existsSync(filePath)) {
              try {
                // Using dynamic import to load the serverless function
                // We add a cache buster to allow live reloading of API changes
                const modulePath = `${filePath}?update=${Date.now()}`
                const { default: handler } = await server.ssrLoadModule(filePath)

                const request = {
                  query: Object.fromEntries(url.searchParams.entries()),
                  method: req.method,
                  body: req.body, // In a real setup, we'd need a body parser
                  headers: req.headers
                }

                const response = {
                  status(code) {
                    res.statusCode = code
                    return this
                  },
                  json(data) {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(data))
                    return this
                  }
                }

                await handler(request, response)
                return
              } catch (error) {
                console.error('API Error:', error)
                res.statusCode = 500
                res.end(JSON.stringify({ error: error.message }))
                return
              }
            }
          }
          next()
        })
      }
    }
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
