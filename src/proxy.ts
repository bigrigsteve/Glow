import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/log', '/calendar', '/insights', '/profile']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!PROTECTED.some((r) => pathname.startsWith(r))) return NextResponse.next()

  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  if (!sessionToken) return NextResponse.redirect(new URL('/login', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/log/:path*', '/calendar/:path*', '/insights/:path*', '/profile/:path*'],
}
