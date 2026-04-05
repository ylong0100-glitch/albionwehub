// =============================================================================
// PvP & Killboard type definitions
// =============================================================================

// ---------------------------------------------------------------------------
// Kill event (simplified view)
// ---------------------------------------------------------------------------
export interface KillEventSummary {
  eventId: number
  timestamp: string
  killerName: string
  killerGuild: string
  killerAlliance: string
  killerIp: number
  victimName: string
  victimGuild: string
  victimAlliance: string
  victimIp: number
  totalFame: number
  participantCount: number
  location: string | null
  killArea: string | null
  category: string | null
}

// ---------------------------------------------------------------------------
// Player PvP stats
// ---------------------------------------------------------------------------
export interface PlayerPvPStats {
  playerId: string
  playerName: string
  region: string
  totalKills: number
  totalDeaths: number
  killFame: number
  deathFame: number
  kdRatio: number
  fameRatio: number
  avgKillFame: number
  avgDeathFame: number
  /** Most used weapons (top 5) */
  topWeapons: WeaponUsage[]
  /** Activity by hour (0-23) */
  activityByHour: number[]
  /** Kill/death trend over time */
  recentTrend: PvPTrendPoint[]
}

export interface WeaponUsage {
  itemId: string
  kills: number
  deaths: number
  totalFame: number
  winRate: number
}

export interface PvPTrendPoint {
  date: string
  kills: number
  deaths: number
  fame: number
}

// ---------------------------------------------------------------------------
// Battle summary
// ---------------------------------------------------------------------------
export interface BattleSummary {
  battleId: number
  startTime: string
  endTime: string
  totalKills: number
  totalFame: number
  /** Participating players count */
  playerCount: number
  /** Top guilds involved */
  topGuilds: BattleGuildEntry[]
  /** Top alliances involved */
  topAlliances: BattleAllianceEntry[]
}

export interface BattleGuildEntry {
  guildId: string
  guildName: string
  kills: number
  deaths: number
  fame: number
}

export interface BattleAllianceEntry {
  allianceId: string
  allianceName: string
  allianceTag: string
  kills: number
  deaths: number
  fame: number
  guildCount: number
}

// ---------------------------------------------------------------------------
// Guild PvP stats
// ---------------------------------------------------------------------------
export interface GuildPvPStats {
  guildId: string
  guildName: string
  memberCount: number
  totalKillFame: number
  totalDeathFame: number
  fameRatio: number
  /** Top killers in guild */
  topKillers: GuildMemberPvPEntry[]
  /** Biggest kills */
  biggestKills: KillEventSummary[]
}

export interface GuildMemberPvPEntry {
  playerId: string
  playerName: string
  killFame: number
  kills: number
  deaths: number
}

// ---------------------------------------------------------------------------
// ZvZ / GvG
// ---------------------------------------------------------------------------
export interface ZvZEvent {
  battleId: number
  timestamp: string
  location: string
  totalPlayers: number
  totalKills: number
  totalFame: number
  winner: string | null
  alliances: ZvZAllianceParticipation[]
}

export interface ZvZAllianceParticipation {
  allianceId: string
  allianceName: string
  allianceTag: string
  playerCount: number
  kills: number
  deaths: number
  fame: number
}

// ---------------------------------------------------------------------------
// Corrupted dungeon
// ---------------------------------------------------------------------------
export interface CorruptedDungeonResult {
  eventId: number
  timestamp: string
  winner: CorruptedDungeonPlayer
  loser: CorruptedDungeonPlayer
  tier: 'stalker' | 'slayer'
  totalFame: number
}

export interface CorruptedDungeonPlayer {
  playerId: string
  playerName: string
  guildName: string
  ip: number
  mainWeapon: string
  equipment: Record<string, string | null>
}

// ---------------------------------------------------------------------------
// Hellgate
// ---------------------------------------------------------------------------
export interface HellgateResult {
  eventId: number
  timestamp: string
  tier: number
  type: '2v2' | '5v5' | '10v10'
  totalFame: number
  winners: HellgateTeamEntry[]
  losers: HellgateTeamEntry[]
}

export interface HellgateTeamEntry {
  playerId: string
  playerName: string
  guildName: string
  ip: number
  mainWeapon: string
}

// ---------------------------------------------------------------------------
// Crystal league
// ---------------------------------------------------------------------------
export interface CrystalMatch {
  matchId: string
  timestamp: string
  level: number
  team1: CrystalTeam
  team2: CrystalTeam
  winnerId: string
}

export interface CrystalTeam {
  teamId: string
  guildName: string
  players: CrystalPlayer[]
  score: number
}

export interface CrystalPlayer {
  playerId: string
  playerName: string
  ip: number
  mainWeapon: string
  kills: number
  deaths: number
  healingDone: number
}
