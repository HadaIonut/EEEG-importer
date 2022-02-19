import { ContainerHeader } from './miscTypes'
import { capitalize } from './Utils'

export const parseSecAttributes = (NPCsAsActors, folderId, loadingBar, hasCustomNPCLocation, location) =>
  async (primaryAttribute, attributeType: ContainerHeader, createActor, createJournal) => {
    let folder, NPCFolder
    if (!(hasCustomNPCLocation[0] && attributeType === 'NPCs')) {
      folder = await Folder.create({
        name: capitalize(attributeType),
        type: 'JournalEntry',
        parent: folderId
      })
    }

    if (NPCsAsActors && attributeType === 'NPCs' && !hasCustomNPCLocation[1]) {
      NPCFolder = await Folder.create({
        name: capitalize(attributeType),
        type: 'Actor',
        parent: null
      })
    }

    for (const secAttribute in primaryAttribute) {
      if (!primaryAttribute.hasOwnProperty(secAttribute)) { continue }
      loadingBar()

      if (NPCsAsActors && attributeType === 'NPCs') {
        await createActor(
          primaryAttribute[secAttribute],
          hasCustomNPCLocation[1] ? location[1] : NPCFolder.data._id
        )
      }
      await createJournal(
        primaryAttribute[secAttribute],
        hasCustomNPCLocation[0] && attributeType === 'NPCs'
          ? location[0]
          : folder.data._id
      )
    }
  }
