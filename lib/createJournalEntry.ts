import { RawTextType } from './miscTypes'
import { prepareText } from './prepareText'

export const createJournalEntry = async (entityName: string, rawText: RawTextType, folder: string): Promise<JournalEntry> =>
  await JournalEntry.create({
    name: entityName,
    content: prepareText(rawText),
    folder: folder
  })
