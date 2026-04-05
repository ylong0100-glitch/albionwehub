// =============================================================================
// Albion Online Gameinfo API wrapper
// Provides typed access to player, guild, alliance, and kill event data
// =============================================================================

import { albionFetch, type Region } from './client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PlayerInfo {
  Id: string
  Name: string
  GuildId: string
  GuildName: string
  AllianceId: string
  AllianceName: string
  Avatar: string
  AvatarRing: string
  KillFame: number
  DeathFame: number
  FameRatio: number
  totalKills: number
  gvgKills: number
  gvgWon: number
  LifetimeStatistics: LifetimeStatistics
}

export interface LifetimeStatistics {
  PvE: { Total: number; Royal: number; Outlands: number; Avalon: number; Hellgate: number; CorruptedDungeon: number }
  Gathering: { Fiber: FameEntry; Hide: FameEntry; Ore: FameEntry; Rock: FameEntry; Wood: FameEntry; All: FameEntry }
  Crafting: { Total: number; Royal: number; Outlands: number; Avalon: number }
  CrystalLeague: number
  FishingFame: number
  FarmingFame: number
  Timestamp: string
}

export interface FameEntry {
  Total: number
  Royal: number
  Outlands: number
  Avalon: number
}

export interface PlayerSearchResult {
  Id: string
  Name: string
  GuildId: string
  GuildName: string
  AllianceId: string
  AllianceName: string
  Avatar: string
  AvatarRing: string
  KillFame: number
  DeathFame: number
  FameRatio: number
}

export interface GuildInfo {
  Id: string
  Name: string
  FounderId: string
  FounderName: string
  Founded: string
  AllianceId: string
  AllianceName: string
  AllianceTag: string
  Logo: string | null
  killFame: number
  DeathFame: number
  MemberCount: number
}

export interface GuildMember {
  Id: string
  Name: string
  GuildName: string
  KillFame: number
  DeathFame: number
  FameRatio: number
  LifetimeStatistics: LifetimeStatistics
}

export interface Equipment {
  MainHand: EquipmentItem | null
  OffHand: EquipmentItem | null
  Head: EquipmentItem | null
  Armor: EquipmentItem | null
  Shoes: EquipmentItem | null
  Bag: EquipmentItem | null
  Cape: EquipmentItem | null
  Mount: EquipmentItem | null
  Potion: EquipmentItem | null
  Food: EquipmentItem | null
}

export interface EquipmentItem {
  Type: string
  Count: number
  Quality: number
  ActiveSpells: string[]
  PassiveSpells: string[]
}

export interface KillParticipant {
  Id: string
  Name: string
  GuildId: string
  GuildName: string
  AllianceId: string
  AllianceName: string
  AllianceTag: string
  Avatar: string
  AvatarRing: string
  DeathFame: number
  KillFame: number
  FameRatio: number
  AverageItemPower: number
  Equipment: Equipment
  Inventory: (EquipmentItem | null)[]
}

export interface KillEvent {
  EventId: number
  TimeStamp: string
  Version: number
  Killer: KillParticipant
  Victim: KillParticipant
  TotalVictimKillFame: number
  Location: string | null
  Participants: KillParticipant[]
  GroupMembers: KillParticipant[]
  GvGMatch: unknown | null
  BattleId: number
  KillArea: string | null
  Category: string | null
  Type: string
}

export interface AllianceInfo {
  AllianceId: string
  AllianceName: string
  AllianceTag: string
  Founded: string
  NumPlayers: number
  NumGuilds: number
  Guilds: GuildInfo[]
}

// ---------------------------------------------------------------------------
// Player API
// ---------------------------------------------------------------------------
export async function searchPlayers(
  query: string,
  region?: Region,
): Promise<PlayerSearchResult[]> {
  return albionFetch<PlayerSearchResult[]>('/search', {
    region,
    params: { q: query },
    gameinfo: true,
  })
}

export async function getPlayer(
  id: string,
  region?: Region,
): Promise<PlayerInfo> {
  return albionFetch<PlayerInfo>(`/players/${id}`, {
    region,
    gameinfo: true,
  })
}

export async function getPlayerKills(
  id: string,
  region?: Region,
): Promise<KillEvent[]> {
  return albionFetch<KillEvent[]>(`/players/${id}/kills`, {
    region,
    gameinfo: true,
  })
}

export async function getPlayerDeaths(
  id: string,
  region?: Region,
): Promise<KillEvent[]> {
  return albionFetch<KillEvent[]>(`/players/${id}/deaths`, {
    region,
    gameinfo: true,
  })
}

export async function getPlayerTopKills(
  id: string,
  options: { range?: 'week' | 'month' | 'lastWeek' | 'lastMonth'; offset?: number; limit?: number; region?: Region } = {},
): Promise<KillEvent[]> {
  const { range = 'week', offset, limit, region } = options
  const params: Record<string, string> = { range }
  if (offset !== undefined) params.offset = String(offset)
  if (limit !== undefined) params.limit = String(limit)

  return albionFetch<KillEvent[]>(`/players/${id}/topkills`, {
    region,
    params,
    gameinfo: true,
  })
}

// ---------------------------------------------------------------------------
// Guild API
// ---------------------------------------------------------------------------
export async function getGuild(
  id: string,
  region?: Region,
): Promise<GuildInfo> {
  return albionFetch<GuildInfo>(`/guilds/${id}`, {
    region,
    gameinfo: true,
  })
}

export async function getGuildMembers(
  id: string,
  region?: Region,
): Promise<GuildMember[]> {
  return albionFetch<GuildMember[]>(`/guilds/${id}/members`, {
    region,
    gameinfo: true,
  })
}

export async function getGuildKills(
  id: string,
  region?: Region,
): Promise<KillEvent[]> {
  return albionFetch<KillEvent[]>(`/guilds/${id}/kills`, {
    region,
    gameinfo: true,
  })
}

export async function getGuildTopKills(
  id: string,
  options: { range?: 'week' | 'month' | 'lastWeek' | 'lastMonth'; limit?: number; offset?: number; region?: Region } = {},
): Promise<KillEvent[]> {
  const { range = 'week', limit, offset, region } = options
  const params: Record<string, string> = { range }
  if (limit !== undefined) params.limit = String(limit)
  if (offset !== undefined) params.offset = String(offset)

  return albionFetch<KillEvent[]>(`/guilds/${id}/topkills`, {
    region,
    params,
    gameinfo: true,
  })
}

// ---------------------------------------------------------------------------
// Alliance API
// ---------------------------------------------------------------------------
export async function getAlliance(
  id: string,
  region?: Region,
): Promise<AllianceInfo> {
  return albionFetch<AllianceInfo>(`/alliances/${id}`, {
    region,
    gameinfo: true,
  })
}

// ---------------------------------------------------------------------------
// Events (Killboard) API
// ---------------------------------------------------------------------------
export async function getEvents(
  options: {
    limit?: number
    offset?: number
    region?: Region
  } = {},
): Promise<KillEvent[]> {
  const { limit, offset, region } = options
  const params: Record<string, string> = {}
  if (limit !== undefined) params.limit = String(limit)
  if (offset !== undefined) params.offset = String(offset)

  return albionFetch<KillEvent[]>('/events', {
    region,
    params,
    gameinfo: true,
  })
}

export async function getEvent(
  eventId: number,
  region?: Region,
): Promise<KillEvent> {
  return albionFetch<KillEvent>(`/events/${eventId}`, {
    region,
    gameinfo: true,
  })
}

// ---------------------------------------------------------------------------
// Battles API
// ---------------------------------------------------------------------------
export interface BattleInfo {
  id: number
  startTime: string
  endTime: string
  totalKills: number
  totalFame: number
  players: Record<string, unknown>
  guilds: Record<string, unknown>
  alliances: Record<string, unknown>
}

export async function getBattles(
  options: {
    limit?: number
    offset?: number
    sort?: 'recent' | 'totalFame' | 'totalKills'
    region?: Region
  } = {},
): Promise<BattleInfo[]> {
  const { limit, offset, sort, region } = options
  const params: Record<string, string> = {}
  if (limit !== undefined) params.limit = String(limit)
  if (offset !== undefined) params.offset = String(offset)
  if (sort) params.sort = sort

  return albionFetch<BattleInfo[]>('/battles', {
    region,
    params,
    gameinfo: true,
  })
}
