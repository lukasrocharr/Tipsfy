import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/onboarding' },
})

export const config = {
  matcher: ['/dashboard/:path*', '/plans/:path*', '/subscribers/:path*', '/tips/:path*', '/financials/:path*', '/settings/:path*'],
}
