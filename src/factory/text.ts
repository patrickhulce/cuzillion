import {NetworkResourceResponse, IFactory, withDefaults, TextConfig} from '../types'

const LOREM_IPSUM = [
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  `Maecenas quis mi interdum, scelerisque nibh volutpat, mattis ligula.`,
  `Sed lobortis nunc quis aliquet fringilla.`,
  `Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.`,
  `Nullam condimentum dapibus erat et suscipit.`,
  `Cras vitae consectetur lorem.`,
  `Vivamus ornare ornare erat, et scelerisque augue aliquet eu.`,
  `Integer consectetur justo eu cursus luctus.`,
  `Nullam in augue ex.`,
  `Nunc dui libero, fringilla non varius vel, ultricies id velit.`,
  `Pellentesque facilisis nibh sed turpis tincidunt pharetra.`,
  `Nam ut tellus purus.`,
  `Proin euismod odio magna, non varius nisl congue ac.`,
  `Ut pretium augue consequat tristique ornare.`,
  `Nullam molestie ante quis dolor fermentum, ac pellentesque nibh posuere.`,
]

export function createText(
  config: TextConfig,
  factory: IFactory,
): Omit<NetworkResourceResponse, 'link'> {
  const {textContent} = withDefaults(config)

  return {
    config,
    headers: {'content-type': 'text/plain'},
    body: textContent,
  }
}

export function injectTextBytes(body: string, totalByteTarget: number): string {
  const currentBytes = body.length
  const bytesNeeded = totalByteTarget - currentBytes
  let injection = ''
  while (injection.length < bytesNeeded) {
    const randomIndex = Math.round(Math.random() * (LOREM_IPSUM.length - 1))
    injection += LOREM_IPSUM[randomIndex]
    injection += ' '
  }

  return `${body}\n${injection.slice(0, bytesNeeded)}`
}
