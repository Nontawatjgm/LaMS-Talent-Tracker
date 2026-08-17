export type Position = "GK" | "CB" | "LB" | "RB" | "CDM" | "CM" | "CAM" | "LW" | "RW" | "ST" | "DEF" | "MID" | "FWD"
export type Status = "promoted" | "barca_atletic" | "juvenil_a" | "loaned" | "released" | "transferred" | "sold" | "academy"

export interface PreSeason {
  season: string         // "2024/25"
  year: number           // 2024
  appearances?: number
  minutesPlayed?: number
  goals?: number
  assists?: number
  notes?: string         // Thai description
  tourLocation?: string
}

export interface Player {
  id: string
  name: string
  position: Position
  nationality: string
  flagEmoji: string
  dateOfBirth: string    // "YYYY-MM-DD"
  height?: number        // cm
  lamasiaYear: number    // year joined La Masia
  preSeasons: PreSeason[]
  currentStatus: Status
  currentClub?: string
  descriptionTH?: string // คำอธิบายภาษาไทย
  jerseyNumber?: number
  imageUrl?: string
  actionShotUrl?: string
  preferredFoot?: "Right" | "Left" | "Both"
  marketValueM?: number
  firstTeamDebutDate?: string
  socialInstagram?: string
}

export interface SeasonGroup {
  season: string         // "2024/25"
  year: number
  players: Player[]
}
