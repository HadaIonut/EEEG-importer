import { game } from './miscTypes'

export const secondPassActors = async (ids) => {
  const allActors: Actors = game.actors
  const allJournals: Journal = game.journal
  for (const id of ids[1]) {
    const actor = allActors.get(id)
    if (!actor) { continue }
    const actorClone = JSON.parse(JSON.stringify(actor))
    let replaceText = actorClone.data.details.biography.value
    replaceText = replaceText.replace(
      /@JournalEntry\[([\w]+)\]{(.*?)}/g,
      (_0, original, name) => {
        for (const value of allJournals.values()) {
          if (value.data.name.toLowerCase() === name.toLowerCase()) { return `@JournalEntry[${value.data._id}]{${name}}` }
        }
        return name
      }
    )
    replaceText = replaceText.replace(
      /@JournalEntry\[(\w+-\w+-\w+-\w+-\w+)\]/g,
      (_0, uid) => `@Actor[${ids[0].get(uid)}]`
    )
    replaceText = replaceText.replace(
      /@Actor\[undefined\]{(.*?)}/g,
      (_0, name) => name
    )
    actorClone.data.details.biography.value = replaceText
    await actor.update(actorClone)
  }
}
