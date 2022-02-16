import { createAndUpdateActor } from './createAndUpdateActor'
import { createAndUpdateJournal } from './createAndUpdateJournal'
import { ExportedJson } from './miscTypes'
import { parseMainAttributes } from './parseMainAttributes'

export const iterateJson = async (
  jsonData: ExportedJson,
  cityName: string,
  folderId: string,
  NPCsAsActors,
  loadingBar,
  parseSecAttr
) => {
  const uidToIdMap = new Map()
  const uidToActorIdMap = new Map()
  const createdArray = []
  const createdActorsArray = []
  const actorCreateMethod = createAndUpdateActor(
    uidToActorIdMap,
    createdActorsArray
  )
  const journalCreateMethod = createAndUpdateJournal(uidToIdMap, createdArray)

  for (const attribute in jsonData) {
    if (!jsonData.hasOwnProperty(attribute)) { continue }

    loadingBar()
    if (typeof jsonData[attribute] !== 'string') {
      await parseSecAttr(
        jsonData[attribute],
        attribute,
        actorCreateMethod,
        journalCreateMethod
      )
    } else {
      await parseMainAttributes(
        attribute,
        cityName,
        jsonData[attribute],
        folderId,
        createdArray
      )
    }
  }
  return [
    [uidToIdMap, createdArray],
    [uidToActorIdMap, createdActorsArray]
  ]
}
