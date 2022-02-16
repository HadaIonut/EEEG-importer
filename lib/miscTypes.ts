import '@league-of-foundry-developers/foundry-vtt-types'
export type RawTextType = string
export let game: Game

export type ContainerStrings = 'start' | 'town'
export type ContainerRecords = 'buildings' | 'NPCs' | 'factions'
export type ContainerHeader = ContainerRecords | ContainerStrings

export interface Data {
  name: string
  key: string
  output: string | Data
}
interface Container {
  [key: string]: Record<string, Data> | string
}

export type ExportedJson = {
  [key in ContainerStrings]: string
} & {
    [key in ContainerRecords]: Record<string, Data>
  }
