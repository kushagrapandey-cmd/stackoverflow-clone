import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import getOrCreateDB from './models/server/dbSetup'
import getOrCreateStorage from './models/server/storageSetup'

// Ensure setup only runs once per process to avoid race conditions in dev
let setupPromise: Promise<void> | null = null
async function ensureSetupOnce() {
  if (!setupPromise) {
    setupPromise = Promise.all([
      getOrCreateDB(),
      getOrCreateStorage(),
    ]).then(() => void 0)
  }
  return setupPromise
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function middleware(request: NextRequest) {
  await ensureSetupOnce()
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [ "/((?!api|_next/static|_next/image|favicon.ico).*)" ]
}
