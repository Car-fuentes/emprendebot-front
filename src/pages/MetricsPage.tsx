import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer } from '../components/layout/Drawer'
import { PageBackButton } from '../components/navigation/PageBackButton'
import { Avatar } from '../components/ui/Avatar'
import { AppIcon, type AppIconName } from '../components/ui/AppIcon'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { useCurrentMetrics } from '../features/metrics/current/useCurrentMetrics'
import type { MetricsDay } from '../features/metrics/current/currentMetrics.types'

interface MetricCardProps {
  label: string
  value: number | string
  icon: AppIconName
  tone: string
}

function MetricCard({ label, value, icon, tone }: MetricCardProps) {
  return (
    <article className="legacy-metrics-card legacy-metrics-stat">
      <span className={`legacy-metrics-stat__icon legacy-metrics-stat__icon--${tone}`}>
        <AppIcon name={icon} size={23} />
      </span>
      <strong>{value}</strong>
      <p>{label}</p>
    </article>
  )
}

function ActivityChart({ days }: { days: MetricsDay[] }) {
  const maximum = Math.max(1, ...days.flatMap(day => [day.consultas, day.presupuestos]))
  return (
    <div className="legacy-metrics-chart" role="img" aria-label="Consultas y presupuestos de los últimos siete días">
      {days.map(day => (
        <div className="legacy-metrics-chart__day" key={day.dateKey}>
          <div className="legacy-metrics-chart__bars">
            <span className="legacy-metrics-chart__value">
              <b>{day.consultas}</b>
              <i
                className="legacy-metrics-chart__bar legacy-metrics-chart__bar--consultas"
                style={{ height: `${Math.max(5, (day.consultas / maximum) * 100)}%` }}
              />
            </span>
            <span className="legacy-metrics-chart__value">
              <b>{day.presupuestos}</b>
              <i
                className="legacy-metrics-chart__bar legacy-metrics-chart__bar--budgets"
                style={{ height: `${Math.max(5, (day.presupuestos / maximum) * 100)}%` }}
              />
            </span>
          </div>
          <small>{day.label}</small>
        </div>
      ))}
    </div>
  )
}

export function MetricsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { business, loadBusiness } = useBusiness()
  const { data, isLoading, error, refetch } = useCurrentMetrics()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (user) void loadBusiness(user.id)
  }, [loadBusiness, user])

  if (!user) return null

  const hasData = Boolean(data && (data.totalConsultas > 0 || data.totalPresupuestos > 0))

  return (
    <div className="legacy-metrics-page">
      <Drawer
        business={business}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem="metricas"
        desktopPersistent
        showBusinessAvatar
      />
      <div className="legacy-metrics-page__content">
        <header className="legacy-metrics-header">
          <button type="button" aria-label="Abrir navegación" onClick={() => setDrawerOpen(true)}>
            <AppIcon name="menu" size={22} />
          </button>
          <strong>Métricas</strong>
          <Avatar name={user.nombre} src={business?.logo} size={38} />
        </header>

        <main className="legacy-metrics-main">
          <PageBackButton onClick={() => navigate('/dashboard')} />
          <div className="legacy-metrics-heading">
            <span>ANÁLISIS</span>
            <h1>Métricas</h1>
            <p>Rendimiento de tu chatbot con los datos registrados por tu negocio.</p>
          </div>

          {isLoading ? (
            <section className="legacy-metrics-state" aria-busy="true">Cargando métricas…</section>
          ) : error ? (
            <section className="legacy-metrics-state" role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => void refetch()}>Reintentar</button>
            </section>
          ) : data ? (
            <>
              <section className="legacy-metrics-stats" aria-label="Resumen de métricas">
                <MetricCard label="Consultas iniciadas" value={data.totalConsultas} icon="chat" tone="teal" />
                <MetricCard label="Presupuestos generados" value={data.totalPresupuestos} icon="budget" tone="purple" />
                <MetricCard label="Ventas concretadas" value={data.totalConcretados} icon="check" tone="green" />
                <MetricCard label="Tasa de conversión" value={`${data.conversionRate}%`} icon="metrics" tone="blue" />
              </section>

              {!hasData ? (
                <section className="legacy-metrics-state legacy-metrics-state--empty">
                  <AppIcon name="metrics" size={44} />
                  <h2>Los datos aparecerán aquí</h2>
                  <p>Cuando tus clientes inicien consultas o soliciten presupuestos vas a ver el rendimiento en esta pantalla.</p>
                </section>
              ) : (
                <section className="legacy-metrics-grid">
                  <article className="legacy-metrics-card">
                    <h2>Actividad de los últimos 7 días</h2>
                    <ActivityChart days={data.days} />
                    <div className="legacy-metrics-legend">
                      <span><i className="is-consultas" />Consultas</span>
                      <span><i className="is-budgets" />Presupuestos</span>
                    </div>
                  </article>
                  <article className="legacy-metrics-card">
                    <h2>Estado de presupuestos</h2>
                    {data.budgetStates.length ? (
                      <ul className="legacy-metrics-statuses">
                        {data.budgetStates.map(state => (
                          <li key={state.estado}>
                            <i style={{ background: state.color }} />
                            <span>{state.label}</span>
                            <strong>{state.value}</strong>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="legacy-metrics-muted">Aún no hay presupuestos registrados.</p>}
                    {data.budgetsArePartial && (
                      <small className="legacy-metrics-note">El desglose muestra los 100 presupuestos más recientes.</small>
                    )}
                  </article>
                </section>
              )}
            </>
          ) : null}
        </main>
      </div>
      <style>{`
        .legacy-metrics-page{--lm-bg:#f4f7f9;--lm-card:#fff;--lm-text:#111827;--lm-muted:#4b5563;--lm-border:#d6dee7;position:fixed;inset:0;z-index:10;min-height:100svh;overflow:auto;background:var(--lm-bg);color:var(--lm-text);font-size:16px}
        :root[data-theme='dark'] .legacy-metrics-page{--lm-bg:#0f172a;--lm-card:#1e293b;--lm-text:#f8fafc;--lm-muted:#c1ccda;--lm-border:#43536a}
        .legacy-metrics-page__content{min-height:100svh}.legacy-metrics-header{min-height:64px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--lm-border);background:var(--lm-card)}
        .legacy-metrics-header button{display:grid;place-items:center;border:1px solid var(--lm-border);border-radius:10px;width:40px;height:40px;background:transparent;color:inherit}
        .legacy-metrics-main{max-width:1280px;margin:0 auto;padding:32px 28px 80px}.legacy-metrics-heading{margin:28px 0}.legacy-metrics-heading span{font-size:13px;font-weight:800;letter-spacing:.14em;color:#0e8e89}
        .legacy-metrics-heading h1{font-size:36px;line-height:1.2;margin:8px 0}.legacy-metrics-heading p,.legacy-metrics-muted{margin:0;color:var(--lm-muted);font-size:16px}
        .legacy-metrics-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.legacy-metrics-card,.legacy-metrics-state{border:1px solid var(--lm-border);border-radius:18px;background:var(--lm-card);padding:22px;box-shadow:0 8px 24px rgba(15,23,42,.05)}
        .legacy-metrics-stat__icon{display:grid;place-items:center;width:46px;height:46px;border-radius:13px;color:#fff;margin-bottom:18px}.legacy-metrics-stat__icon--teal{background:linear-gradient(135deg,#13a8a2,#1372a8)}.legacy-metrics-stat__icon--purple{background:linear-gradient(135deg,#8b5cf6,#ec4899)}.legacy-metrics-stat__icon--green{background:linear-gradient(135deg,#10b981,#13a8a2)}.legacy-metrics-stat__icon--blue{background:linear-gradient(135deg,#1372a8,#3b82f6)}
        .legacy-metrics-stat>strong{font-size:34px;line-height:1.1}.legacy-metrics-stat p{margin:9px 0 0;color:var(--lm-muted);font-size:15px;font-weight:600}.legacy-metrics-state{margin-top:22px;text-align:center;color:var(--lm-muted);font-size:16px}.legacy-metrics-state h2{color:var(--lm-text);font-size:22px}
        .legacy-metrics-state button{border:0;border-radius:10px;background:#0f918c;color:#fff;font-size:15px;font-weight:700;padding:11px 20px}.legacy-metrics-state--empty{padding:56px 24px}.legacy-metrics-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:20px;margin-top:22px}.legacy-metrics-card h2{font-size:20px;line-height:1.35;margin:0 0 24px}
        .legacy-metrics-chart{height:240px;display:flex;align-items:stretch;gap:14px;border-bottom:1px solid var(--lm-border)}.legacy-metrics-chart__day{flex:1;display:flex;min-width:0;flex-direction:column;justify-content:flex-end;align-items:center;gap:9px}.legacy-metrics-chart__bars{height:195px;width:100%;display:flex;align-items:flex-end;justify-content:center;gap:7px}
        .legacy-metrics-chart__value{height:100%;width:min(24px,40%);display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px}.legacy-metrics-chart__value b{font-size:12px;color:var(--lm-text)}.legacy-metrics-chart__bar{display:block;width:100%;min-height:5px;border-radius:7px 7px 0 0}.legacy-metrics-chart__bar--consultas{background:linear-gradient(#13a8a2,#1372a8)}.legacy-metrics-chart__bar--budgets{background:linear-gradient(#a855f7,#ec4899)}.legacy-metrics-chart small{color:var(--lm-muted);font-size:13px;font-weight:600;text-transform:capitalize}
        .legacy-metrics-legend{display:flex;justify-content:center;gap:24px;margin-top:18px;font-size:14px;font-weight:600}.legacy-metrics-legend span{display:flex;align-items:center;gap:7px}.legacy-metrics-legend i,.legacy-metrics-statuses i{width:10px;height:10px;border-radius:50%}.legacy-metrics-legend .is-consultas{background:#13a8a2}.legacy-metrics-legend .is-budgets{background:#a855f7}
        .legacy-metrics-statuses{list-style:none;padding:0;margin:0;display:grid;gap:14px}.legacy-metrics-statuses li{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:11px;padding:14px;border:1px solid var(--lm-border);border-radius:12px;font-size:15px}.legacy-metrics-statuses li strong{font-size:17px}.legacy-metrics-note{display:block;margin-top:16px;color:var(--lm-muted);font-size:13px;line-height:1.5}
        @media(min-width:1000px){.legacy-metrics-page__content{margin-left:280px}.legacy-metrics-header{display:none}.legacy-metrics-main{padding-top:40px}}
        @media(max-width:760px){.legacy-metrics-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.legacy-metrics-grid{grid-template-columns:1fr}.legacy-metrics-main{padding-inline:16px}}
        @media(max-width:430px){.legacy-metrics-stats{grid-template-columns:1fr}.legacy-metrics-heading h1{font-size:28px}.legacy-metrics-chart{gap:6px}.legacy-metrics-card{padding:17px}}
      `}</style>
    </div>
  )
}
