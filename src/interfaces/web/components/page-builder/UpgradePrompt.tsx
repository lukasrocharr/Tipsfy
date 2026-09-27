import Link from "next/link"

export default function UpgradePrompt({ message }: { message: string }) {
  return (
    <main className="flex min-h-[65dvh] items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-xl border border-emerald-800/40 bg-emerald-950/15 p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Recurso exclusivo PRO
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-100">
          Desbloqueie o editor da página
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          {message}
        </p>
        <Link
          href="/plans"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          Ver planos disponíveis
        </Link>
      </section>
    </main>
  )
}
