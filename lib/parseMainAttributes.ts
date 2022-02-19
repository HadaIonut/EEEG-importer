import { ContainerHeader } from './miscTypes'

export const parseMainAttributes = async (
  attribute: ContainerHeader,
  cityName: string,
  attributeData,
  folderId,
  createdArray
) => {
  let name = attribute === 'start' ? cityName : attribute
  name = name === 'town' ? `Description of ${cityName}` : name

  const newEntry = await createJournalEntry(name, attributeData, folderId)
  createdArray.push(newEntry.data._id)
}
