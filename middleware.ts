import createMiddleware from 'next-intl/middleware'
import { routing } from '@/lib/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /icons, /manifest.json (public files)
  // - All files with extensions (e.g. favicon.ico)
  matcher: ['/', '/(en|zh|de|ru|pt|es|fr|ko)/:path*'],
}
