// =============================================================================
// Albion Online API Client
// Fetch wrapper with retry, rate limiting, deduplication, and timeout
// =============================================================================

const PROXY_BASE = '/api/v1'

// ---------------------------------------------------------------------------
// Region mapping
// ---------------------------------------------------------------------------
export type Region = 'west' | 'east' | 'europe'

const REGION_URLS: Record<Region, string> = {
  west: 'https://west.albion-online-data.com/api/v2/stats',
  east: 'https://east.albion-online-data.com/api/v2/stats',
  europe: 'https://europe.albion-online-data.com/api/v2/stats',
}

const GAMEINFO_URLS: Record<Region, string> = {
  west: 'https://gameinfo.albiononline.com/api/gameinfo',
  east: 'https://gameinfo-sgp.albiononline.com/api/gameinfo',
  europe: 'https://gameinfo-ams.albiononline.com/api/gameinfo',
}

// ---------------------------------------------------------------------------
// Typed error
// ---------------------------------------------------------------------------
export class AlbionApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public endpoint: string,
  ) {
    super(message)
    this.name = 'AlbionApiError'
  }
}

// ---------------------------------------------------------------------------
// Token bucket rate limiter
// ---------------------------------------------------------------------------
class TokenBucket {
  private tokens: number
  private lastRefill: number

  constructor(
    private maxTokens: number,
    private refillRate: number, // tokens per second
  ) {
    this.tokens = maxTokens
    this.lastRefill = Date.now()
  }

  consume(): boolean {
    this.refill()
    if (this.tokens >= 1) {
      this.tokens -= 1
      return true
    }
    return false
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate)
    this.lastRefill = now
  }

  /** Milliseconds until at least 1 token is available */
  waitTime(): number {
    this.refill()
    if (this.tokens >= 1) return 0
    return Math.ceil(((1 - this.tokens) / this.refillRate) * 1000)
  }
}

// Singleton rate limiter: 150 requests per minute
const rateLimiter = new TokenBucket(150, 150 / 60)

// ---------------------------------------------------------------------------
// Request deduplication
// ---------------------------------------------------------------------------
interface PendingEntry<T> {
  promise: Promise<T>
  timestamp: number
}

const pendingRequests = new Map<string, PendingEntry<unknown>>()

const DEDUP_WINDOW_MS = 100

function cleanupPending(): void {
  const now = Date.now()
  for (const [key, entry] of pendingRequests) {
    if (now - entry.timestamp > DEDUP_WINDOW_MS) {
      pendingRequests.delete(key)
    }
  }
}

// ---------------------------------------------------------------------------
// Retry configuration
// ---------------------------------------------------------------------------
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000 // 1s, 2s, 4s

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500
}

// ---------------------------------------------------------------------------
// Fetch options
// ---------------------------------------------------------------------------
export interface FetchOptions {
  region?: Region
  params?: Record<string, string>
  signal?: AbortSignal
  /** Use gameinfo base URL instead of data API */
  gameinfo?: boolean
  /** Skip deduplication for this request */
  skipDedup?: boolean
}

// ---------------------------------------------------------------------------
// Wait helper
// ---------------------------------------------------------------------------
function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
    })
  })
}

// ---------------------------------------------------------------------------
// Core fetch function
// ---------------------------------------------------------------------------
export async function albionFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { region, params, signal: externalSignal, gameinfo = false, skipDedup = false } = options

  // Build full URL
  let baseUrl: string
  if (region) {
    baseUrl = gameinfo ? GAMEINFO_URLS[region] : REGION_URLS[region]
  } else {
    baseUrl = gameinfo ? GAMEINFO_URLS.west : PROXY_BASE
  }

  const url = new URL(`${baseUrl}${endpoint}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const urlString = url.toString()

  // --- Deduplication ---
  if (!skipDedup) {
    cleanupPending()
    const existing = pendingRequests.get(urlString) as PendingEntry<T> | undefined
    if (existing && Date.now() - existing.timestamp <= DEDUP_WINDOW_MS) {
      return existing.promise
    }
  }

  const requestPromise = executeWithRetry<T>(urlString, endpoint, externalSignal)

  if (!skipDedup) {
    pendingRequests.set(urlString, { promise: requestPromise, timestamp: Date.now() })
    // Auto-cleanup after promise settles
    requestPromise.finally(() => {
      const entry = pendingRequests.get(urlString)
      if (entry && entry.promise === requestPromise) {
        pendingRequests.delete(urlString)
      }
    })
  }

  return requestPromise
}

async function executeWithRetry<T>(
  url: string,
  endpoint: string,
  externalSignal?: AbortSignal,
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Rate limiting: wait if needed
    const waitMs = rateLimiter.waitTime()
    if (waitMs > 0) {
      await wait(waitMs, externalSignal)
    }

    if (!rateLimiter.consume()) {
      // Should not happen after waiting, but guard anyway
      throw new AlbionApiError(429, 'Rate limit exceeded', endpoint)
    }

    // Timeout via AbortController (10s)
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => timeoutController.abort(), 10_000)

    // Combine external signal with timeout signal
    const combinedSignal = externalSignal
      ? combineAbortSignals(externalSignal, timeoutController.signal)
      : timeoutController.signal

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: combinedSignal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (isRetryable(response.status) && attempt < MAX_RETRIES - 1) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt)
          lastError = new AlbionApiError(response.status, `HTTP ${response.status}`, endpoint)
          await wait(delay, externalSignal)
          continue
        }

        throw new AlbionApiError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`,
          endpoint,
        )
      }

      const data = (await response.json()) as T
      return data
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof AlbionApiError) {
        throw error
      }

      // AbortError from external signal - rethrow immediately
      if (externalSignal?.aborted) {
        throw error
      }

      // Timeout or network error - retry
      if (attempt < MAX_RETRIES - 1) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const delay = BASE_DELAY_MS * Math.pow(2, attempt)
        await wait(delay, externalSignal)
        continue
      }

      throw new AlbionApiError(
        0,
        error instanceof Error ? error.message : 'Network error',
        endpoint,
      )
    }
  }

  // Should not reach here, but just in case
  throw lastError ?? new AlbionApiError(0, 'Request failed', endpoint)
}

// ---------------------------------------------------------------------------
// Combine multiple AbortSignals
// ---------------------------------------------------------------------------
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  // Use AbortSignal.any if available (modern browsers)
  if ('any' in AbortSignal && typeof AbortSignal.any === 'function') {
    return AbortSignal.any(signals)
  }

  // Fallback for older environments
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      return controller.signal
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }
  return controller.signal
}
