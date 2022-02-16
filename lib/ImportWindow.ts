import '@league-of-foundry-developers/foundry-vtt-types'
import { createCity } from './createCity'
let game: Game
const prepareDisplayName = (folder: Folder) => {
  if (folder.depth === 1) return folder.data.name
  return (
    prepareDisplayName(game.folders.get(folder.data.parent)) +
    '/' +
    folder.data.name
  )
}

const isFoundry8 = () => {
  const foundryVersion = game.data.version
  return foundryVersion >= '0.8.0' && foundryVersion < '0.9.0'
}

type Height = number | 'auto'
const height = 'auto'

export default class ImportWindow extends Application {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      id: 'md-importer',
      template: 'modules/EEEG-Importer/templates/importer.html',
      resizable: false,
      height: height,
      width: 400,
      minimizable: true,
      title: 'EEEG Importer'
    }
  }

  activateListeners(html) {
    super.activateListeners(html)

    const locationSelector = html.find('#customLocation')
    const locationSelectorActors = html.find('#customLocationActor')

    const folders = isFoundry8() ? game.folders : game.folders.entries
    for (const folder of folders) {
      if (folder.data.type === 'JournalEntry') {
        locationSelector.append(
          new Option(prepareDisplayName(folder), folder.data._id)
        )
      }
      if (folder.data.type === 'Actor') {
        locationSelectorActors.append(
          new Option(prepareDisplayName(folder), folder.data._id)
        )
      }
    }

    html.find('#submit').on('click', () => {
      const textContent = html.find('#text-input')[0].value
      const importAsActors = html.find('#NPCsActors')[0].checked
      const selectedLocation = locationSelector.find('option:selected').val()
      const selectedLocationActors = locationSelectorActors
        .find('option:selected')
        .val()

      createCity(
        textContent,
        importAsActors,
        [selectedLocation !== 'default', selectedLocationActors !== 'default'],
        [selectedLocation, selectedLocationActors]
      )
    })
  }
}
