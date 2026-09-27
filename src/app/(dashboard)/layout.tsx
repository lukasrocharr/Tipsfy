import type { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "../../infrastructure/factories/authOptions"
import { PrismaTipsterRepository } from "../../infrastructure/database/PrismaTipsterRepository"
import DashboardLayout from "../../interfaces/web/app/(dashboard)/layout"

export default async function DashboardRouteLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	const session = await getServerSession(authOptions)
	const tipster = session?.user?.id
		? await new PrismaTipsterRepository().buscarPorId(session.user.id)
		: null

	return (
		<DashboardLayout isPro={tipster?.planTier === "PRO"}>
			{children}
		</DashboardLayout>
	)
}
