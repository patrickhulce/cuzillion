import * as http from 'http'

type Response = {
  _body: string
  status: number
  headers: Record<string, string | string[] | undefined>
  text(): Promise<string>
  json<T = any>(): Promise<T>
}

export async function fetch(url: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        if (!res.statusCode) return reject(new Error(`No status code`))
        if (!res.statusCode) return reject(new Error(`No status code`))

        let bodyResolve: (s: string) => void
        let bodyReject: (error: Error) => void
        const bodyPromise = new Promise<string>((r1, r2) => {
          bodyResolve = r1
          bodyReject = r2
        })

        const response = {
          _body: '',
          status: res.statusCode,
          headers: res.headers || {},
          text: () => bodyPromise,
          json: () => bodyPromise.then((body) => JSON.parse(body)),
        }

        res.on('data', (chunk) => (response._body += chunk))
        res.on('error', (err) => bodyReject(err))
        res.on('end', () => bodyResolve(response._body))

        resolve(response)
      })
      .on('error', reject)
  })
}
