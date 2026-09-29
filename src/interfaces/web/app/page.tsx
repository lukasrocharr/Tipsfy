import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../infrastructure/factories/authOptions'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Tipsfy — Sua assinatura, seus resultados.',
  description:
    'Tipsfy — gestão de assinaturas, pagamentos, acesso e resultados para grupos de sinais esportivos.',
  openGraph: {
    title: 'Tipsfy — Sua assinatura, seus resultados.',
    description:
      'Gestão inteligente para tipsters com assinaturas, pagamentos, acesso e performance em um só lugar.',
    url: 'https://tipsfy.app/',
    siteName: 'Tipsfy',
    type: 'website',
  },
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  const loginHref = session ? '/dashboard' : '/login'

  return (
    <div className={styles.landingPage}>
      <header className={styles.navbar}>
        <Link className={styles.brand} href="/" aria-label="Tipsfy">
          <Image src="/brand/icon-mark.svg" alt="Tipsfy" width={33} height={33} className={styles.brandMark} />
          <span>
            Tips<span>fy</span>
          </span>
        </Link>

        <nav className={styles.navLinks} aria-label="Navegação principal">
          <Link href="#recursos">Recursos</Link>
          <Link href="#como-funciona">Como funciona</Link>
          <Link href="#precos">Preços</Link>
          <Link href="#faq">FAQ</Link>
        </nav>

        <div className={styles.navActions}>
          <Link className={styles.navLogin} href={loginHref}>
            Entrar
          </Link>
          <Link className={`${styles.btn} ${styles.btnOutline} ${styles.navCta}`} href="/onboarding">
            Começar grátis
          </Link>
        </div>
        <button type="button" className={styles.menuBtn} aria-label="Abrir menu">
          ☰
        </button>
      </header>

      <main id="inicio">
        <section className={`${styles.section} ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <span className={styles.dot} /> GESTÃO INTELIGENTE PARA TIPSTERS
            </div>
            <h1>
              Seu grupo de sinais.
              <br />
              <span>Mais organizado.</span>
              <br />
              Mais transparente.
            </h1>
            <p className={styles.heroText}>
              Automatize assinaturas, pagamentos e controle de acesso ao seu grupo. Acompanhe
              resultados e ofereça aos seus assinantes um painel próprio de performance.
            </p>
            <div className={styles.heroActions}>
              <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/onboarding">
                Começar grátis por 14 dias <span>→</span>
              </Link>
              <Link className={`${styles.btn} ${styles.btnGhost}`} href="#como-funciona">
                Ver como funciona
              </Link>
            </div>
            <div className={styles.trustRow}>
              <span>✓ Sem cartão na v1</span>
              <span>✓ Web responsiva</span>
              <span>✓ Pix recorrente</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.glow} />
            <div className={styles.dashboardWindow}>
              <div className={styles.windowTop}>
                <div className={styles.traffic}>
                  <i />
                  <i />
                  <i />
                </div>
                <span>app.tipsfy</span>
                <span className={styles.livePill}>● AO VIVO</span>
              </div>
              <div className={styles.dashBody}>
                <aside className={styles.sidebar}>
                  <div className={styles.miniBrand}>
                    <Image src="/brand/icon-mark.svg" alt="Tipsfy" width={19} height={19} className={styles.miniMark} />
                    Tips<span>fy</span>
                  </div>
                  <div className={`${styles.sideItem} ${styles.active}`}>⌂ <span>Início</span></div>
                  <div className={styles.sideItem}>♙ <span>Assinantes</span></div>
                  <div className={styles.sideItem}>⌁ <span>Sinais</span></div>
                  <div className={styles.sideItem}>◔ <span>Resultados</span></div>
                  <div className={styles.sideItem}>▣ <span>Financeiro</span></div>
                  <div className={styles.sideItem}>⚙ <span>Configurações</span></div>
                </aside>
                <div className={styles.dashContent}>
                  <div className={styles.dashHeading}>
                    <div>
                      <small>Olá, Rafael 👋</small>
                      <h3>Seu grupo, mais organizado.</h3>
                    </div>
                    <div className={styles.avatar}>R</div>
                  </div>
                  <div className={styles.metricGrid}>
                    <div className={styles.metric}>
                      <small>Assinantes ativos</small>
                      <strong>482</strong>
                      <b>↗ 12%</b>
                    </div>
                    <div className={styles.metric}>
                      <small>Receita do mês</small>
                      <strong>R$ 19.280</strong>
                      <b>↗ 8%</b>
                    </div>
                    <div className={styles.metric}>
                      <small>Taxa de acerto</small>
                      <strong>68%</strong>
                      <b>↗ 5%</b>
                    </div>
                  </div>
                  <div className={styles.chartRow}>
                    <div className={styles.chartCard}>
                      <div className={styles.cardTitle}>Evolução da receita</div>
                      <div className={styles.chart}>
                        <svg viewBox="0 0 500 160" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00E676" stopOpacity=".28" />
                              <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,130 L45,110 L85,120 L125,88 L170,101 L215,70 L260,84 L305,53 L350,72 L395,42 L445,57 L500,22 L500,160 L0,160 Z" fill="url(#fill)" />
                          <polyline points="0,130 45,110 85,120 125,88 170,101 215,70 260,84 305,53 350,72 395,42 445,57 500,22" fill="none" stroke="#00E676" strokeWidth="4" />
                        </svg>
                      </div>
                      <div className={styles.months}>
                        <span>Jan</span>
                        <span>Mar</span>
                        <span>Mai</span>
                        <span>Jul</span>
                        <span>Set</span>
                      </div>
                    </div>
                    <div className={styles.donutCard}>
                      <div className={styles.cardTitle}>Resultados do grupo</div>
                      <div className={styles.donutWrap}>
                        <div className={styles.donut} />
                        <div>
                          <strong>103</strong>
                          <small>GREEN</small>
                          <strong>77</strong>
                          <small>RED</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.tipsCard}>
                    <div className={styles.cardTitle}>Últimos sinais</div>
                    <div className={styles.tipRow}>
                      <span>Flamengo x Palmeiras</span>
                      <span>Over 2.5</span>
                      <em>✓ Acerto</em>
                      <b>+1.85</b>
                    </div>
                    <div className={styles.tipRow}>
                      <span>Al-Hilal x Al Nassr</span>
                      <span>Ambos marcam</span>
                      <em>✓ Acerto</em>
                      <b>+1.72</b>
                    </div>
                    <div className={styles.tipRow}>
                      <span>Boca Juniors x River</span>
                      <span>Under 2.5</span>
                      <em className={styles.red}>× Erro</em>
                      <b>-1.00</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.phone}>
              <div className={styles.phoneNotch} />
              <div className={styles.phoneScreen}>
                <div className={styles.phoneLogo}>T↗</div>
                <h4>
                  Seus resultados
                  <br />
                  em tempo real.
                </h4>
                <p>Acompanhe o desempenho do seu grupo.</p>
                <div className={styles.phoneStat}>
                  <span>Taxa de acerto</span>
                  <strong>68%</strong>
                </div>
                <div className={styles.phoneStat}>
                  <span>ROI</span>
                  <strong>+12,4%</strong>
                </div>
                <Link href={loginHref} className={styles.phoneButton}>
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.problem}`} id="recursos">
          <div className={styles.sectionHeading}>
            <div className={styles.eyebrow}>O PROBLEMA</div>
            <h2>
              Ainda controla tudo no
              <br />
              <span>WhatsApp, Telegram e planilha?</span>
            </h2>
            <p>
              Chega de perder tempo conferindo pagamentos, atualizando planilhas e procurando
              resultados em centenas de mensagens.
            </p>
          </div>
          <div className={styles.cards3}>
            <article className={styles.featureCard}>
              <div className={styles.icon}>₿</div>
              <h3>Cobranças manuais</h3>
              <p>Centralize suas assinaturas e acompanhe vencimentos sem depender de conferências manuais.</p>
            </article>
            <article className={styles.featureCard}>
              <div className={styles.icon}>▤</div>
              <h3>Planilhas desorganizadas</h3>
              <p>Tenha assinantes, pagamentos, acessos e status reunidos em um único painel.</p>
            </article>
            <article className={styles.featureCard}>
              <div className={styles.icon}>◔</div>
              <h3>Histórico difícil</h3>
              <p>Transforme o histórico das suas tips em dados claros para você e seus assinantes.</p>
            </article>
          </div>
        </section>

        <section className={`${styles.section} ${styles.solution}`}>
          <div className={styles.solutionCopy}>
            <div className={styles.eyebrow}>A SOLUÇÃO</div>
            <h2>
              Tudo o que você precisa para gerenciar seu grupo.
              <br />
              <span>Em um só lugar.</span>
            </h2>
            <p>
              O Tipsfy centraliza a operação comercial do seu grupo de sinais e transforma seu
              histórico de tips em uma experiência mais organizada.
            </p>
            <Link className={styles.textLink} href="#como-funciona">
              Conheça o fluxo completo →
            </Link>
          </div>
          <div className={styles.featureList}>
            <div className={styles.featureLine}>
              <span>01</span>
              <div>
                <h3>Assinaturas</h3>
                <p>Crie planos mensais, trimestrais ou anuais e compartilhe seu checkout.</p>
              </div>
            </div>
            <div className={styles.featureLine}>
              <span>02</span>
              <div>
                <h3>Cobrança via Pix</h3>
                <p>Acompanhe pagamentos e renovações em uma operação centralizada.</p>
              </div>
            </div>
            <div className={styles.featureLine}>
              <span>03</span>
              <div>
                <h3>Controle de acesso</h3>
                <p>Libere ou remova o acesso ao canal conforme o status do pagamento.</p>
              </div>
            </div>
            <div className={styles.featureLine}>
              <span>04</span>
              <div>
                <h3>Histórico de tips</h3>
                <p>Registre evento, odd e resultado e acompanhe taxa de acerto e ROI.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.performance}`}>
          <div className={styles.performanceCopy}>
            <div className={styles.eyebrow}>PERFORMANCE</div>
            <h2>
              Seus resultados.
              <br />
              <span>Sem esconder os números.</span>
            </h2>
            <p>Registre cada tip, acompanhe seu histórico e tenha uma visão clara da performance do grupo.</p>
            <div className={styles.statsInline}>
              <div>
                <strong>68%</strong>
                <span>Taxa de acerto</span>
              </div>
              <div>
                <strong>+12,4%</strong>
                <span>ROI acumulado</span>
              </div>
              <div>
                <strong>240</strong>
                <span>Tips registradas</span>
              </div>
            </div>
          </div>

          <div className={styles.performancePanel}>
            <div className={styles.panelTop}>
              <span>Performance do grupo</span>
              <span className={styles.period}>Últimos 30 dias ▾</span>
            </div>
            <div className={styles.bigNumber}>
              +12,4% <small>ROI</small>
            </div>
            <div className={styles.bars}>
              <i style={{ height: '38%' }} />
              <i style={{ height: '55%' }} />
              <i style={{ height: '45%' }} />
              <i style={{ height: '72%' }} />
              <i style={{ height: '60%' }} />
              <i style={{ height: '88%' }} />
              <i style={{ height: '76%' }} />
              <i style={{ height: '96%' }} />
              <i style={{ height: '83%' }} />
              <i style={{ height: '100%' }} />
            </div>
            <div className={styles.barLabels}>
              <span>01</span>
              <span>05</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.subscriber}`}>
          <div className={styles.subscriberMock}>
            <div className={styles.subscriberWindow}>
              <div className={styles.subHeader}>
                <div className={styles.miniBrand}>
                  <Image src="/brand/icon-mark.svg" alt="Tipsfy" width={19} height={19} className={styles.miniMark} />
                  Tips<span>fy</span>
                </div>
                <span className={styles.userPill}>D</span>
              </div>
              <div className={styles.subTitle}>
                <small>Meu grupo</small>
                <h3>Resultados</h3>
              </div>
              <div className={styles.subStats}>
                <div>
                  <small>Taxa de acerto</small>
                  <strong>68%</strong>
                </div>
                <div>
                  <small>ROI</small>
                  <strong>+12,4%</strong>
                </div>
              </div>
              <div className={styles.history}>
                <div className={styles.historyTitle}>Últimas tips</div>
                <div>
                  <div>
                    <b>Flamengo x Palmeiras</b>
                    <small>Over 2.5 · 1.85</small>
                  </div>
                  <em>GREEN</em>
                </div>
                <div>
                  <div>
                    <b>Al-Hilal x Al Nassr</b>
                    <small>Ambos marcam · 1.72</small>
                  </div>
                  <em>GREEN</em>
                </div>
                <div>
                  <div>
                    <b>Boca Juniors x River</b>
                    <small>Under 2.5 · 1.90</small>
                  </div>
                  <em className={styles.bad}>RED</em>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.subscriberCopy}>
            <div className={styles.eyebrow}>PARA O ASSINANTE</div>
            <h2>Seu assinante também acompanha tudo.</h2>
            <p>
              Uma área simples para consultar o histórico de tips, resultados, taxa de acerto e ROI
              do grupo que ele assina.
            </p>
            <div className={styles.checkList}>
              <span>✓ Histórico organizado por data</span>
              <span>✓ Odds e resultados visíveis</span>
              <span>✓ Taxa de acerto e ROI</span>
              <span>✓ Acesso pelo navegador</span>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.steps}`} id="como-funciona">
          <div className={`${styles.sectionHeading} ${styles.center}`}>
            <div className={styles.eyebrow}>COMO FUNCIONA</div>
            <h2>
              Do pagamento ao acesso.
              <br />
              <span>Tudo organizado.</span>
            </h2>
          </div>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <span>01</span>
              <h3>Crie seu plano</h3>
              <p>Defina preço e periodicidade da assinatura.</p>
            </div>
            <div className={styles.step}>
              <span>02</span>
              <h3>Compartilhe</h3>
              <p>Envie seu link de checkout para sua audiência.</p>
            </div>
            <div className={styles.step}>
              <span>03</span>
              <h3>Pagamento</h3>
              <p>O assinante paga via Pix pelo checkout.</p>
            </div>
            <div className={styles.step}>
              <span>04</span>
              <h3>Acesso liberado</h3>
              <p>Após a confirmação, o acesso ao canal é liberado.</p>
            </div>
            <div className={styles.step}>
              <span>05</span>
              <h3>Registre as tips</h3>
              <p>Mantenha seu histórico e resultados organizados.</p>
            </div>
            <div className={styles.step}>
              <span>06</span>
              <h3>Acompanhe</h3>
              <p>Você e seus assinantes consultam a performance.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.pricing}`} id="precos">
          <div className={`${styles.sectionHeading} ${styles.center}`}>
            <div className={styles.eyebrow}>PLANOS</div>
            <h2>Comece sem complicação.</h2>
            <p>Experimente o Tipsfy por 14 dias e conheça a plataforma na prática.</p>
          </div>
          <div className={styles.priceCard}>
            <div className={styles.priceMain}>
              <span className={styles.priceBadge}>14 DIAS GRÁTIS</span>
              <h3>Tipsfy</h3>
              <p className={styles.price}>
                <sup>R$</sup>69<span>/mês</span>
              </p>
              <p>Uma estrutura enxuta para organizar sua operação.</p>
              <Link className={`${styles.btn} ${styles.btnPrimary} ${styles.full}`} href="/onboarding">
                Começar meu teste grátis
              </Link>
            </div>
            <div className={styles.priceFeatures}>
              <div>✓ Gestão de assinantes</div>
              <div>✓ Cobrança recorrente via Pix</div>
              <div>✓ Controle de acesso ao Telegram</div>
              <div>✓ Histórico de tips</div>
              <div>✓ Painel de performance</div>
              <div>✓ Painel para assinantes</div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.faq}`} id="faq">
          <div className={`${styles.sectionHeading} ${styles.center}`}>
            <div className={styles.eyebrow}>FAQ</div>
            <h2>Perguntas frequentes</h2>
          </div>
          <div className={styles.faqList}>
            <details>
              <summary>
                O Tipsfy realiza apostas?<span>+</span>
              </summary>
              <p>
                Não. O Tipsfy é uma ferramenta de gestão para quem produz e distribui análises e
                sinais esportivos. Ele não realiza apostas nem processa apostas de terceiros.
              </p>
            </details>
            <details>
              <summary>
                O pagamento é por cartão?<span>+</span>
              </summary>
              <p>Na primeira versão do produto, o modelo está concentrado em Pix.</p>
            </details>
            <details>
              <summary>
                Preciso instalar um aplicativo?<span>+</span>
              </summary>
              <p>Não. A primeira versão é uma aplicação web responsiva, acessível pelo navegador.</p>
            </details>
            <details>
              <summary>
                Funciona com Telegram?<span>+</span>
              </summary>
              <p>Sim. A primeira versão prevê integração com a Telegram Bot API para gerenciamento de acesso ao canal.</p>
            </details>
            <details>
              <summary>
                O acesso é removido quando o assinante fica inadimplente?<span>+</span>
              </summary>
              <p>O MVP prevê remoção automática após o prazo de tolerância configurado.</p>
            </details>
          </div>
        </section>

        <section className={`${styles.section} ${styles.finalCta}`} id="cta">
          <div className={styles.ctaGlow} />
          <div className={styles.eyebrow}>TIPSFY</div>
          <h2>
            Pare de perder tempo
            <br />
            <span>administrando planilhas.</span>
          </h2>
          <p>Organize seu grupo. Automatize sua operação. Mostre seus resultados.</p>
          <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/onboarding">
            Começar meu teste grátis <span>→</span>
          </Link>
          <small>14 dias grátis · Sem compromisso</small>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Image src="/brand/icon-mark.svg" alt="Tipsfy" width={27} height={27} className={styles.footerBrandMark} />
          <span>
            Tips<span>fy</span>
          </span>
        </div>
        <p>Gestão de assinaturas para grupos de sinais esportivos.</p>
        <span>© 2026 Tipsfy. Todos os direitos reservados.</span>
      </footer>
    </div>
  )
}
