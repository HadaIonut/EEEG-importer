import { game } from './miscTypes'
import { capitalize } from './Utils'

export const secondPassJournals = async (ids, loadingBar) => {
  const allJournals: Journal = game.journal
  for (const id of ids[1]) {
    loadingBar()
    const journal = allJournals.get(id)
    const journalClone = JSON.parse(JSON.stringify(journal))
    journalClone.content = journalClone.content.replace(
      /@JournalEntry\[(\w+)\]/g,
      (_0, uid) => `@JournalEntry[${ids[0].get(uid) || ids[0].get(capitalize(uid))}]`
    )
    journalClone.content = journalClone.content.replace(
      /@JournalEntry\[(\w+-\w+-\w+-\w+-\w+)\]/g,
      (_0, uid) => `@JournalEntry[${ids[0].get(uid)}]`
    )
    journalClone.content = journalClone.content.replace(
      /@JournalEntry\[undefined\]{(.*?)}/g,
      (_0, name) => name
    )
    journalClone.content = journalClone.content.replace(
      /@JournalEntry\[link-internal\]{(.*?)}/g,
      (_0, name) => name
    )
    journalClone.content = journalClone.content.replace(
      /@JournalEntry\[tip-([\w-]+)\]{(.*?)}/g,
      (_0, original, name) => {
        for (const value of allJournals.values()) {
          if (value.data.name.toLowerCase() === name.toLowerCase()) { return `@JournalEntry[${value.data._id}]{${name}}` }
        }
        return name
      }
    )
    await journal.update(journalClone)
  }
}
