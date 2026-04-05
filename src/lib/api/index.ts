// =============================================================================
// API module barrel export
// =============================================================================

export { albionFetch, AlbionApiError } from './client'
export type { Region, FetchOptions } from './client'

export {
  getPrices,
  getHistory,
  getGoldPrices,
} from './albion-data'
export type { PriceEntry, HistoryEntry, HistoryDataPoint, GoldPrice } from './albion-data'

export {
  searchPlayers,
  getPlayer,
  getPlayerKills,
  getPlayerDeaths,
  getPlayerTopKills,
  getGuild,
  getGuildMembers,
  getGuildKills,
  getGuildTopKills,
  getAlliance,
  getEvents,
  getEvent,
  getBattles,
} from './gameinfo'
export type {
  PlayerInfo,
  PlayerSearchResult,
  GuildInfo,
  GuildMember,
  KillEvent,
  KillParticipant,
  Equipment,
  EquipmentItem,
  AllianceInfo,
  BattleInfo,
} from './gameinfo'

export {
  getItemIconUrl,
  getSpellIconUrl,
  getGuildLogoUrl,
  getWardrobeIconUrl,
} from './render'
export type { ItemIconOptions } from './render'
