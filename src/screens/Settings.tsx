import { useState } from 'react'
import { Card, Btn, Input, SectionHeader } from '../components/ui'

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-sm font-semibold text-zinc-100">{title}</p>
        {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#1e1e24] last:border-0">
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
      </div>
      <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const [tab, setTab] = useState<'profile' | 'telegram' | 'notifications' | 'payments' | 'danger'>('profile')

  const [profile, setProfile] = useState({ name: 'Rafael Tipster', email: 'rafael@tipsfy.io', bio: 'Análises profissionais para futebol e tênis. +3 anos de histórico verificado.', channel: '@SinaisFutebolVIP', site: 'https://rafaeltipster.com' })
  const [notif, setNotif] = useState({ newSubscriber: true, payment: true, delinquent: true, tips: false, weekly: true })
  const [connected, setConnected] = useState(true)
  const [botToken] = useState('1234567890:AAHd_••••••••••••••')
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'telegram', label: 'Telegram', icon: '✈️' },
    { id: 'notifications', label: 'Notificações', icon: '🔔' },
    { id: 'payments', label: 'Pagamentos', icon: '💳' },
    { id: 'danger', label: 'Conta', icon: '⚙️' },
  ] as const

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 lg:px-6">
      <SectionHeader title="Configurações" sub="Gerencie sua conta, integrações e preferências." />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <nav className="lg:w-48 flex-shrink-0">
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full text-left ${tab === t.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'}`}>
                <span className="text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'profile' && (
            <Card className="p-6 space-y-6">
              <Section title="Perfil Público" sub="Informações exibidas na sua página pública.">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl font-black text-white">R</div>
                    <div>
                      <button className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors">Alterar foto</button>
                      <p className="text-[10px] text-zinc-700 mt-1.5">JPG, PNG ou GIF • máx. 2MB</p>
                    </div>
                  </div>
                  <Input label="Nome de exibição" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                  <Input label="E-mail da conta" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-400">Bio (aparece na página pública)</label>
                    <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 transition-all resize-none" />
                  </div>
                  <Input label="Handle do Canal" value={profile.channel} onChange={e => setProfile(p => ({ ...p, channel: e.target.value }))} placeholder="@SeuCanal" />
                  <Input label="Site ou link externo (opcional)" value={profile.site} onChange={e => setProfile(p => ({ ...p, site: e.target.value }))} placeholder="https://..." />
                </div>
              </Section>
              <div className="pt-2 flex items-center gap-3">
                <Btn onClick={save} className="w-40">
                  {saved ? '✓ Salvo!' : 'Salvar Perfil'}
                </Btn>
                {saved && <span className="text-xs text-emerald-400">Alterações salvas com sucesso.</span>}
              </div>
            </Card>
          )}

          {tab === 'telegram' && (
            <div className="space-y-4">
              <Card className="p-6">
                <Section title="Status da Integração" sub="Conexão atual do bot com seu canal.">
                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${connected ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-red-950/20 border-red-900/30'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-950/50 text-red-400'}`}>
                      {connected
                        ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                      }
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
                        {connected ? 'Bot online e funcionando' : 'Bot desconectado'}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">Canal: @SinaisFutebolVIP • Último ping: agora</p>
                    </div>
                    <button onClick={() => setConnected(!connected)} className="ml-auto text-xs bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 px-3 py-1.5 rounded-lg transition-colors">
                      {connected ? 'Desconectar' : 'Reconectar'}
                    </button>
                  </div>
                </Section>
              </Card>

              <Card className="p-6">
                <Section title="Configurações do Bot" sub="Token e comportamento automático.">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-400">Token do Bot</label>
                      <div className="flex gap-2">
                        <input value={botToken} readOnly className="flex-1 bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-500 outline-none" />
                        <button className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap">Alterar</button>
                      </div>
                    </div>

                    <div className="space-y-0 divide-y divide-[#1e1e24] border border-[#1e1e24] rounded-xl overflow-hidden">
                      {[
                        { label: 'Boas-vindas automáticas', sub: 'Enviar mensagem ao novo assinante entrar', val: true },
                        { label: 'Remoção automática', sub: 'Remover membro ao cancelar ou inadimplir por 3 dias', val: true },
                        { label: 'Lembrete de cobrança', sub: 'Avisar o assinante 3 dias antes do vencimento', val: false },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between px-4 py-3.5">
                          <div>
                            <p className="text-sm text-zinc-200">{item.label}</p>
                            <p className="text-xs text-zinc-600 mt-0.5">{item.sub}</p>
                          </div>
                          <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${item.val ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.val ? 'translate-x-6' : 'translate-x-1'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>
              </Card>
            </div>
          )}

          {tab === 'notifications' && (
            <Card className="p-6">
              <Section title="Preferências de Notificação" sub="Configure quando e como ser notificado.">
                <div className="space-y-0 border border-[#1e1e24] rounded-xl overflow-hidden divide-y divide-[#1e1e24]">
                  {[
                    { key: 'newSubscriber' as const, label: 'Novo assinante', sub: 'Quando alguém se inscrever no seu canal' },
                    { key: 'payment' as const, label: 'Pagamento recebido', sub: 'Confirmação de cada cobrança bem-sucedida' },
                    { key: 'delinquent' as const, label: 'Inadimplência detectada', sub: 'Quando uma cobrança falhar após tentativas' },
                    { key: 'tips' as const, label: 'Lembrete de tips', sub: 'Aviso diário para registrar análises' },
                    { key: 'weekly' as const, label: 'Relatório semanal', sub: 'Resumo de performance às segundas-feiras' },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm text-zinc-200">{n.label}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">{n.sub}</p>
                      </div>
                      <button onClick={() => setNotif(p => ({ ...p, [n.key]: !p[n.key] }))} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${notif[n.key] ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notif[n.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </Section>
              <div className="mt-5">
                <Btn onClick={save} className="w-40">{saved ? '✓ Salvo!' : 'Salvar'}</Btn>
              </div>
            </Card>
          )}

          {tab === 'payments' && (
            <div className="space-y-4">
              <Card className="p-6">
                <Section title="Chave Pix" sub="Para recebimento de assinaturas via Pix.">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-400">Tipo de chave</label>
                      <select className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 transition-all appearance-none">
                        <option>CPF</option>
                        <option>E-mail</option>
                        <option>Telefone</option>
                        <option>Chave aleatória</option>
                      </select>
                    </div>
                    <Input label="Chave Pix" placeholder="rafael@email.com" />
                    <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg px-4 py-3 text-xs text-zinc-500 leading-relaxed">
                      <span className="text-emerald-400 font-medium">Pix verificado.</span> Os pagamentos via Pix são instantâneos e confirmados automaticamente.
                    </div>
                  </div>
                </Section>
              </Card>

              <Card className="p-6">
                <Section title="Dados Bancários para Saque" sub="Conta para recebimento do saldo acumulado.">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Banco" placeholder="Nubank" />
                      <Input label="Agência" placeholder="0001" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Conta" placeholder="1234567-8" />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-zinc-400">Tipo</label>
                        <select className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 transition-all appearance-none">
                          <option>Corrente</option>
                          <option>Poupança</option>
                        </select>
                      </div>
                    </div>
                    <Input label="CPF/CNPJ do titular" placeholder="000.000.000-00" />
                  </div>
                </Section>
                <div className="mt-5">
                  <Btn onClick={save} className="w-48">{saved ? '✓ Salvo!' : 'Salvar Dados Bancários'}</Btn>
                </div>
              </Card>

              <Card className="p-6">
                <Section title="Taxas e Planos Tipsfy" sub="Seu plano atual e estrutura de comissões.">
                  <div className="space-y-3">
                    <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-zinc-100">Plano Starter</p>
                        <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-full font-medium">Ativo</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                          { label: 'Taxa', value: '8%' },
                          { label: 'Saques', value: 'Ilimitados' },
                          { label: 'Planos', value: 'Até 3' },
                        ].map(f => (
                          <div key={f.label} className="bg-zinc-900/40 rounded-lg p-2.5">
                            <p className="text-sm font-bold text-zinc-100 font-mono">{f.value}</p>
                            <p className="text-[10px] text-zinc-600 mt-0.5">{f.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Ver planos disponíveis →</button>
                  </div>
                </Section>
              </Card>
            </div>
          )}

          {tab === 'danger' && (
            <div className="space-y-4">
              <Card className="p-6">
                <Section title="Segurança da Conta">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-[#1e1e24]">
                      <div>
                        <p className="text-sm text-zinc-200">Autenticação de dois fatores</p>
                        <p className="text-xs text-zinc-600 mt-0.5">Proteja sua conta com 2FA via app autenticador</p>
                      </div>
                      <button className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 px-3 py-1.5 rounded-lg transition-colors">Ativar</button>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-[#1e1e24]">
                      <div>
                        <p className="text-sm text-zinc-200">Alterar senha</p>
                        <p className="text-xs text-zinc-600 mt-0.5">Última alteração: nunca</p>
                      </div>
                      <button className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 px-3 py-1.5 rounded-lg transition-colors">Alterar</button>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm text-zinc-200">Sessões ativas</p>
                        <p className="text-xs text-zinc-600 mt-0.5">1 dispositivo conectado</p>
                      </div>
                      <button className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 px-3 py-1.5 rounded-lg transition-colors">Ver todas</button>
                    </div>
                  </div>
                </Section>
              </Card>

              <Card className="p-6 border-red-900/30">
                <p className="text-sm font-semibold text-red-400 mb-1">Zona de Perigo</p>
                <p className="text-xs text-zinc-600 mb-5">Ações irreversíveis. Proceda com cuidado.</p>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-lg transition-colors text-left group">
                    <div>
                      <p className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Exportar todos os dados</p>
                      <p className="text-xs text-zinc-600">Baixar CSV com assinantes, tips e transações</p>
                    </div>
                    <svg className="text-zinc-600" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-red-950/20 hover:bg-red-950/30 rounded-lg transition-colors text-left border border-red-900/30">
                    <div>
                      <p className="text-sm text-red-400">Encerrar conta</p>
                      <p className="text-xs text-zinc-600">Deletar permanentemente todos os dados da plataforma</p>
                    </div>
                    <svg className="text-red-800" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
