import { RawTextType } from './miscTypes'

export const createActor = async (entityName: string, rawText: RawTextType, folder: string): Promise<Actor> => await Actor.create({
  name: entityName,
  data: {
    details: {
      biography: {
        value: prepareText(rawText)
      }
    }
  },
  type: 'npc',
  folder: folder
})
