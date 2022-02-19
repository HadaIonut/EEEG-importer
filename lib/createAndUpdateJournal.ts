import { createJournalEntry } from './createJournalEntry'

export const createAndUpdateJournal = (uidToIdMap, createdArray) => async (journalData: JournalEntry, folder: string) => {
  const newEntry = await createJournalEntry(
    journalData.name,
    `<div class="EEEG">${journalData.output}</div>`,
    folder
  )
  uidToIdMap.set(journalData.key, newEntry.data._id)
  createdArray.push(newEntry.data._id)
}
