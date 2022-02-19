import { decodeHTML } from './decodeHTML'
import { RawTextType } from './miscTypes'

export const prepareText = (rawText: RawTextType) => {
  const decoded = decodeHTML(rawText)
  const $a = $('<div />', { html: decoded })
  const located = $a.find('.link-internal')
  located.replaceWith((index, text) => {
    const id = located[index].getAttribute('data-id')
    if (text.includes('Description of')) return `@JournalEntry[town]{${text}}`
    return id !== '' || id ? `@JournalEntry[${id}]{${text}}` : text
  })
  return $a.html()
}
