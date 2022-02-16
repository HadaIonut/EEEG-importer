import { getTownName } from './getTownName'
import { getTownSize } from './getTownSize'
import { iterateJson } from './iterateJson'
import { parseSecAttributes } from './parseSecAttributes'
import { secondPassActors } from './secondPassActors'
import { secondPassJournals } from './secondPassJournals'
import { loading } from './Utils'

export const createCity = async (
  rawText: string,
  NPCsAsActors,
  hasCustomNPCLocation,
  location
) => {
  const jsonData = JSON.parse(rawText)
  const loadingBar = loading('Importing city.')(0)(getTownSize(jsonData) - 1)
  const townName = getTownName(jsonData)

  const mainFolder = await Folder.create({
    name: townName,
    type: 'JournalEntry',
    parent: null
  })
  const secAttrParser = parseSecAttributes(
    NPCsAsActors,
    mainFolder.data._id,
    loadingBar,
    hasCustomNPCLocation,
    location
  )

  const ids = await iterateJson(
    jsonData,
    townName,
    mainFolder.data._id,
    NPCsAsActors,
    loadingBar,
    secAttrParser
  )
  ids[0][0].set('town', `Description of ${townName}`)

  await secondPassJournals(ids[0], loadingBar)
  if (NPCsAsActors) { await secondPassActors(ids[1]) }

  ui.notifications?.info('Your city has been imported successfully')
}
