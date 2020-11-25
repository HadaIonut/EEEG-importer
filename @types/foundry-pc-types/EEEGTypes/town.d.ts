import { Building, BuildingRelationship } from "./building";
import { Faction } from "./faction";
import { Family, NPC, NpcRelationship, RaceName } from "./npc";

export interface Town {
    name: string
    type: string
    _type: string
    location: string
    population: number
    ignoreGender: boolean
    dominantGender: string
    roll: {
      guardFunding: number
      wealth: number
      economics: number
      welfare: number
      military: number
      law: number
      sin: number
      arcana: number
      equality: number
      religiosity: number
    }
    taxes: {
      welfare: number
      military: number
      economics: number
      base: number
      land: number
      tithe: number
    }
    wealth: string
    economics: string
    welfare: string
    military: string
    law: string
    sin: string
    arcana: string
    hasBrothel: boolean
    pregen?: boolean
    dualLeaders: boolean
    reuseNpcProbability: number
    guard: {
      funding: string
    }
    possibleMaterials: string[]
    materialProbability: {
      [key: string]: {
        probability: number
      }
    }
    professions: Record<string, string & {
      name: string,
      population: number
    }>
    roads: Record<string, string>
    townMaterial: string
    leaderType: string
    leader: NPC
    ruler?: NPC
    founder?: string
    factions: Record<string, Faction>
    families: Record<string, Family>
    buildings: Building[]
    buildingRelations: BuildingRelationship[]
    npcRelations: Record<string, NpcRelationship[]>
    politicalSource: string
    economicIdeology: string
    politicalIdeology: string
    economicIdeologyIST: string
    politicalIdeologyIC: string
    baseDemographics: Record<RaceName, number>
    _baseDemographics: Record<RaceName, number>
    _demographicPercentile: Record<RaceName, number>
    origin: string
    vegetation: string
  }
  