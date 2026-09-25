'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/plans', label: 'Planos', icon: '◇' },
  { href: '/subscribers', label: 'Assinantes', icon: '◎' },
  { href: '/tips', label: 'Tips', icon: '⌁' },
  { href: '/financials', label: 'Financeiro', icon: '▥' },
  { href: '/settings', label: 'Configurações', icon: '⚙' },
]

function Logo() {
  return <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/30 text-white text-xs font-bold">◈</div>
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return <nav className="space-y-0.5">
    {NAV.map(item => {
      const active = pathname === item.href
      return <Link key={item.href} href={item.href} onClick={onNavigate} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/30' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'}`}>
        <span className={`text-base ${active ? 'text-emerald-400' : 'text-zinc-600'}`}>{item.icon}</span>{item.label}
      </Link>
    })}
    <Link href="/p/rafael-tipster" onClick={onNavigate} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent transition-all">
      <span className="text-base text-zinc-600">◎</span>Página Pública
    </Link>
  </nav>
}

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>
}

function DashboardShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mobileNav, setMobileNav] = React.useState(false)
  return <div className="min-h-screen bg-[#08080a] flex">
    <aside className="hidden lg:flex flex-col w-60 border-r border-[#1e1e24] bg-[#0c0c0f] fixed h-full z-30">
      <div className="px-5 h-14 border-b border-[#1e1e24] flex items-center gap-2.5"><Logo /><span className="font-bold text-zinc-100">Tipsfy</span><span className="ml-auto text-xs text-zinc-700 bg-zinc-900 border border-[#1e1e24] px-1.5 py-0.5 rounded font-mono">β</span></div>
      <div className="flex-1 px-3 py-4 overflow-y-auto"><p className="text-xs font-medium text-zinc-700 uppercase tracking-widest px-3 mb-2">Gestão</p><SidebarNav /></div>
      <div className="px-3 py-4 border-t border-[#1e1e24]"><div className="px-3 py-2.5 rounded-xl bg-zinc-900/50 border border-[#1e1e24]"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">R</div><div><p className="text-xs font-semibold text-zinc-200">Rafael Tipster</p><p className="text-xs text-zinc-600 font-mono">@SinaisFutebolVIP</p></div></div></div></div>
    </aside>
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-[#0c0c0f]/95 backdrop-blur border-b border-[#1e1e24] h-12 flex items-center justify-between px-4"><div className="flex items-center gap-2"><Logo /><span className="text-sm font-bold text-zinc-100">Tipsfy</span></div><button onClick={() => setMobileNav(true)} className="text-zinc-400 p-1.5 rounded-lg hover:bg-zinc-800/60" aria-label="Abrir menu">☰</button></header>
    {mobileNav && <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMobileNav(false)}><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div className="absolute right-0 top-0 h-full w-64 bg-[#0c0c0f] border-l border-[#1e1e24]" onClick={event => event.stopPropagation()}><div className="h-12 border-b border-[#1e1e24] flex items-center justify-between px-4"><span className="text-sm font-bold text-zinc-100">Menu</span><button onClick={() => setMobileNav(false)} className="text-zinc-600">✕</button></div><nav className="px-3 py-4"><SidebarNav onNavigate={() => setMobileNav(false)} /></nav></div></div>}
    <main className="flex-1 lg:ml-60 pt-12 lg:pt-0 min-h-screen overflow-x-hidden">{children}</main>
  </div>
}

