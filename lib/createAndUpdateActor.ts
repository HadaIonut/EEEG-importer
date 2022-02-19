import { createActor } from './createActor'

export const createAndUpdateActor = (uidToActorIdMap, createdActorsArray) => async (actorData, NPCFolder: string) => {
  const newActor = await createActor(
    actorData.name,
    `<div class="EEEG">${actorData.output}</div>`,
    NPCFolder
  )
  uidToActorIdMap.set(actorData.key, newActor.data._id)
  createdActorsArray.push(newActor.data._id)
}
