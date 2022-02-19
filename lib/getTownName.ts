import { ExportedJson } from './miscTypes'

export const getTownName = (jsonData: ExportedJson) => {
  const parser = new DOMParser()
  const elem = parser.parseFromString(jsonData.start, 'text/html')
  return $(elem.body).find('.town-name')[0].getAttribute('data-town-name')
}
