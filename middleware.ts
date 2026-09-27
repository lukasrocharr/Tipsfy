import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: { signIn: "/login" },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/plans/:path*",
    "/subscribers/:path*",
    "/tips/:path*",
    "/financials/:path*",
    "/settings/:path*",
    "/public-page-editor/:path*",
  ],
}
