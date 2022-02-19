import { ExportedJson } from './miscTypes'

export const getTownSize = (jsonData: ExportedJson): number => {
  let townSize = 0
  townSize += Object.keys(jsonData).length
  for (const attribute in jsonData) {
    if (!jsonData.hasOwnProperty(attribute)) continue

    if (typeof jsonData[attribute] !== 'string') { townSize += Object.keys(jsonData[attribute]).length * 2 }
  }
  return townSize
}
