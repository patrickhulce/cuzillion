import {createServer} from '../src/server'
import {fetch as fetch_} from '../src/node-fetch'
import {CuzillionConfig, ConfigType, OriginPreference} from '../src/types'
import {serializeConfig} from '../src/serialization'

describe('.createServer', () => {
  let server
  let serverSecondary
  const availableOrigins = []

  beforeAll(async () => {
    server = await createServer({port: 0, availableOrigins})
    serverSecondary = await createServer({port: 0, availableOrigins})
    availableOrigins[0] = `http://localhost:${server.port}`
    availableOrigins[1] = `http://localhost:${serverSecondary.port}`
  })

  afterAll(async () => {
    await server.close()
    await serverSecondary.close()
  })

  function fetch(urlPath: string, config?: CuzillionConfig): ReturnType<typeof fetch_> {
    const url = new URL(`http://localhost:${server.port}${urlPath}`)
    if (config) url.searchParams.set('config', serializeConfig(config))
    return fetch_(url.href)
  }

  describe('factory routes', () => {
    describe('statusCode', () => {
      it('200', async () => {
        const response = await fetch('/api/page.html', {
          type: ConfigType.Page,
        })

        expect(response).toMatchObject({
          status: 200,
          headers: {'content-type': 'text/html; charset=utf-8'},
        })
      })

      it('403', async () => {
        const response = await fetch('/api/page.html', {
          type: ConfigType.Page,
          statusCode: 403,
        })

        expect(response).toMatchObject({status: 403})
      })
    })

    describe('sizeInBytes', () => {
      it('sets the page body size', async () => {
        const response = await fetch('/api/page.html', {
          type: ConfigType.Page,
          sizeInBytes: 14000,
        })

        expect(response).toMatchObject({status: 200})
        expect(await response.text()).toHaveLength(14000)
      })

      it('sets the script body size', async () => {
        const response = await fetch('/api/script.js', {
          type: ConfigType.Script,
          sizeInBytes: 14000,
        })

        expect(response).toMatchObject({status: 200})
        expect(await response.text()).toHaveLength(14000)
      })

      it('sets the stylesheet body size', async () => {
        const response = await fetch('/api/style.css', {
          type: ConfigType.Stylesheet,
          sizeInBytes: 14000,
        })

        expect(response).toMatchObject({status: 200})
        expect(await response.text()).toHaveLength(14000)
      })
    })

    describe('redirects', () => {
      it('single redirect', async () => {
        const redirectResponse = await fetch('/api/page.html', {
          type: ConfigType.Page,
          redirectCount: 1,
        })

        expect(redirectResponse.status).toEqual(302)
        expect(redirectResponse.headers).toHaveProperty('location')
        expect(redirectResponse.headers.location).toMatchInlineSnapshot(
          `"/api/page.html?config=eyJ0IjoicCJ9"`,
        )

        if (typeof redirectResponse.headers.location !== 'string') throw new Error('impossible')
        const response = await fetch(redirectResponse.headers.location)
        expect(response).toMatchObject({status: 200})
      })

      it('multiple redirects', async () => {
        const redirectResponse = await fetch('/api/page.html', {
          type: ConfigType.Page,
          redirectCount: 2,
        })

        expect(redirectResponse.status).toEqual(302)
        expect(redirectResponse.headers).toHaveProperty('location')
        expect(redirectResponse.headers.location).toMatchInlineSnapshot(
          `"/api/page.html?config=eyJ0IjoicCIsInJlZGlyZWN0Q291bnQiOjF9"`,
        )

        if (typeof redirectResponse.headers.location !== 'string') throw new Error('never')
        const secondRedirectResponse = await fetch(redirectResponse.headers.location)
        expect(secondRedirectResponse).toMatchObject({
          status: 302,
          headers: {location: expect.stringContaining('/api/page.html')},
        })

        if (typeof secondRedirectResponse.headers.location !== 'string') throw new Error('never')
        const response = await fetch(secondRedirectResponse.headers.location)
        expect(response).toMatchObject({status: 200})
      })

      it('with fetch delay', async () => {
        const start = Date.now()
        const redirectResponse = await fetch('/api/page.html', {
          type: ConfigType.Page,
          redirectCount: 1,
          fetchDelay: 250,
        })

        expect(redirectResponse.status).toEqual(302)
        expect(Date.now() - start).toBeGreaterThan(250)
      })
    })

    describe('originPreference', () => {
      it('not set origin for no preference', async () => {
        const response = await fetch('/api/page.html', {
          type: ConfigType.Page,
          head: [{type: ConfigType.Script, originPreference: OriginPreference.SameOrigin}],
        })
        const body = await response.text()
        expect(body).not.toContain(availableOrigins[0])
      })

      it('set origin for primary preference', async () => {
        const response = await fetch('/api/page.html', {
          type: ConfigType.Page,
          head: [{type: ConfigType.Script, originPreference: OriginPreference.Primary}],
        })
        const body = await response.text()
        expect(body).toContain(availableOrigins[0])
        expect(body).not.toContain(availableOrigins[1])
      })

      it('set origin for secondary preference', async () => {
        const response = await fetch('/api/page.html', {
          type: ConfigType.Page,
          head: [{type: ConfigType.Script, originPreference: OriginPreference.Secondary}],
        })
        const body = await response.text()
        expect(body).not.toContain(availableOrigins[0])
        expect(body).toContain(availableOrigins[1])
      })
    })
  })
})
