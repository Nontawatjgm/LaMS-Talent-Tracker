export type Position = "GK" | "DEF" | "MID" | "FWD"
export type Status = "promoted" | "loaned" | "released" | "academy"

export interface PreSeason {
  season: string         // "2024/25"
  year: number           // 2024
  appearances?: number
  minutesPlayed?: number
  goals?: number
  assists?: number
  notes?: string         // Thai description
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
}

export interface SeasonGroup {
  season: string         // "2024/25"
  year: number
  players: Player[]
}
