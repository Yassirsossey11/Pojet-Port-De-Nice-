import { NextRequest } from 'next/server'

// Simple in-memory rate limiter (pour production, utiliser Upstash Ratelimit)
const rateLimit = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 60 // 60 requests per minute

export function checkRateLimit(request: NextRequest): {
  success: boolean
  limit: number
  remaining: number
  reset: number
} {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()

  const userLimit = rateLimit.get(ip)

  if (!userLimit || now > userLimit.resetAt) {
    // Nouvelle fenêtre
    rateLimit.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    })

    return {
      success: true,
      limit: MAX_REQUESTS,
      remaining: MAX_REQUESTS - 1,
      reset: now + WINDOW_MS,
    }
  }

  if (userLimit.count >= MAX_REQUESTS) {
    // Rate limit dépassé
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      reset: userLimit.resetAt,
    }
  }

  // Incrémenter le compteur
  userLimit.count++

  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - userLimit.count,
    reset: userLimit.resetAt,
  }
}

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of rateLimit.entries()) {
    if (now > data.resetAt) {
      rateLimit.delete(ip)
    }
  }
}, 5 * 60 * 1000)

