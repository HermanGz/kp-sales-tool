import { useState } from 'react'
import { useData } from '../App.jsx'
import { BuildChip, NotesText } from '../lib/icons.jsx'

const fmt = (s) => {
  if (s == null) return '—'
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${String(ss).padStart(2, '0')}`
}

const KIND_STYLE = {
  boss: 'bg-danger/15 text-danger border-danger/40',
  event: 'bg-teal/10 text-teal-light border-teal/40',
  transition: 'bg-silver/10 text-silver border-silver/30',
}

const STATUS_STYLE = {
  planning: { label: 'Planning', cls: 'bg-silver/10 text-silver border-silver/30' },
  practicing: { label: 'Practicing', cls: 'bg-teal/15 text-teal-light border-teal/40' },
  done: { label: 'DONE', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
}

const ROLE_STYLE = {
  Heal: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  Support: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  DPS: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
}

function RoleChip({ role }) {
  return (
    <span
      className={`inline-flex justify-center w-[4.5rem] shrink-0 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${ROLE_STYLE[role] || ROLE_STYLE.DPS}`}
    >
      {role}
    </span>
  )
}

function Rules({ overview }) {
  return (
    <div className="card p-5">
      <div className="font-display text-xl text-cream mb-1">What is Infallible?</div>
      <p className="text-sm text-silver mb-3">{overview.description}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {overview.rules.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-sm bg-ink/40 border border-teal-deep/25 rounded-xl px-3 py-2">
            <span className="text-teal-light mt-0.5">◆</span>
            <span className="text-cream/90">{r}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WingCard({ w, onOpen }) {
  const fights = w.segments.filter((s) => s.kind === 'boss').length
  const status = STATUS_STYLE[w.status] || STATUS_STYLE.planning
  return (
    <button onClick={onOpen} className="card p-5 text-left hover:border-teal/60 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl text-teal-light">{w.short}</span>
          <span className="font-semibold text-cream group-hover:text-teal-light transition-colors">{w.name}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wider ${status.cls}`}>
          {status.label}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm mb-2">
        <div>
          <span className="text-silver">Time limit </span>
          <span className="font-display text-lg text-cream">{fmt(w.timeLimit)}</span>
        </div>
        <div className="text-silver">
          {fights} fight{fights !== 1 ? 's' : ''}
          {w.cms.length > 0 && <span className="text-danger"> · {w.cms.length} CM{w.cms.length > 1 ? 's' : ''}</span>}
        </div>
      </div>
      {w.cms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {w.cms.map((c) => (
            <span key={c} className="px-2 py-0.5 rounded-md bg-danger/10 border border-danger/30 text-danger text-[11px]">
              {c}
            </span>
          ))}
        </div>
      )}
      <div className="text-xs text-silver/80">{w.timerTrigger}</div>
    </button>
  )
}

function CompBox({ comp, icons }) {
  if (!comp || comp.length === 0)
    return <div className="text-sm text-silver/70 italic">Comp not defined yet — roles pending.</div>
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {[1, 2].map((g) => (
        <div key={g} className="bg-ink/40 border border-teal-deep/25 rounded-xl p-3">
          <div className="text-[11px] uppercase tracking-wider text-teal-light/80 mb-2">Subgroup {g}</div>
          <div className="space-y-1.5">
            {comp
              .filter((c) => c.sub === g)
              .map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <RoleChip role={c.role} />
                  {c.build ? (
                    <BuildChip name={c.build} icons={icons} className="text-cream/90" />
                  ) : (
                    <span className="text-silver/60 italic">build TBD</span>
                  )}
                  {c.note && <span className="text-xs text-silver">· {c.note}</span>}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SegmentDetail({ seg, comp, icons }) {
  const hasContent = seg.strategy || seg.image || (seg.duties && seg.duties.length > 0)
  return (
    <div className="bg-ink/50 border border-teal-deep/25 rounded-xl p-4 space-y-3">
      {seg.image && (
        <img
          src={`${import.meta.env.BASE_URL}${seg.image}`}
          alt={`${seg.name} strategy map`}
          className="rounded-xl border border-teal-deep/30 max-h-[420px] w-auto"
          loading="lazy"
        />
      )}
      {seg.strategy && (
        <div className="text-sm text-cream/90 leading-relaxed">
          <NotesText text={seg.strategy} icons={icons} />
        </div>
      )}
      {seg.duties && seg.duties.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-teal-light/80 mb-1.5">Special duties</div>
          <div className="space-y-1">
            {seg.duties.map((d, i) => {
              const slot = comp?.[d.slot]
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {slot && <RoleChip role={slot.role} />}
                  {slot?.build && <BuildChip name={slot.build} icons={icons} className="text-cream/90" />}
                  <span className="text-silver">→ {d.duty}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {!hasContent && <div className="text-sm text-silver/70 italic">Strategy not written yet.</div>}
    </div>
  )
}

function WingDetail({ w, icons, onBack }) {
  const [open, setOpen] = useState(null)
  const targets = w.segments.map((s) => s.target)
  const allKnown = targets.every((t) => t != null)
  const planned = targets.reduce((a, t) => a + (t || 0), 0)
  let remaining = w.timeLimit
  const status = STATUS_STYLE[w.status] || STATUS_STYLE.planning

  return (
    <div className="space-y-4">
      <button className="btn btn-ghost text-sm" onClick={onBack}>
        ← All wings
      </button>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl text-teal-light">{w.short}</span>
            <span className="font-display text-2xl text-cream">{w.name}</span>
            <span className={`px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wider ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-silver">Time limit</div>
            <div className="font-display text-3xl text-cream">{fmt(w.timeLimit)}</div>
          </div>
        </div>
        <div className="text-sm text-silver mb-2">⏱ {w.timerTrigger}</div>
        {w.cms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {w.cms.map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-md bg-danger/10 border border-danger/30 text-danger text-xs">
                {c} required
              </span>
            ))}
          </div>
        )}
        {allKnown && (
          <div className="mt-3 text-sm">
            <span className="text-silver">Planned total </span>
            <span className="font-semibold text-cream">{fmt(planned)}</span>
            <span className={planned <= w.timeLimit ? 'text-emerald-300' : 'text-danger'}>
              {' '}
              ({planned <= w.timeLimit ? `${fmt(w.timeLimit - planned)} slack` : `${fmt(planned - w.timeLimit)} OVER`})
            </span>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="font-display text-xl text-cream mb-3">Squad comp (roles only)</div>
        <CompBox comp={w.comp} icons={icons} />
      </div>

      <div className="card p-5">
        <div className="font-display text-xl text-cream mb-1">Plan — target maximums</div>
        <div className="text-xs text-silver mb-3">
          Budget per segment. "Left" = time remaining on the wing clock if every target is hit. Click a segment for
          strategy, map and duties.
        </div>
        <div className="space-y-1.5">
          {w.segments.map((seg) => {
            if (seg.target != null && remaining != null) remaining -= seg.target
            const left = seg.target != null && remaining != null ? remaining : null
            if (seg.target == null) remaining = null
            const isOpen = open === seg.id
            return (
              <div key={seg.id}>
                <button
                  onClick={() => setOpen(isOpen ? null : seg.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-colors ${
                    isOpen ? 'bg-teal-deep/20 border-teal/50' : 'bg-ink/40 border-teal-deep/25 hover:border-teal/40'
                  }`}
                >
                  <span
                    className={`px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wider shrink-0 ${KIND_STYLE[seg.kind] || KIND_STYLE.event}`}
                  >
                    {seg.kind}
                  </span>
                  <span className="font-semibold text-cream flex-1">{seg.name}</span>
                  <span className="text-sm text-silver shrink-0">
                    max <span className="font-display text-base text-cream">{fmt(seg.target)}</span>
                  </span>
                  <span className="text-sm shrink-0 w-24 text-right">
                    <span className="text-silver">left </span>
                    <span className={`font-display text-base ${left != null && left < 0 ? 'text-danger' : 'text-teal-light'}`}>
                      {left == null ? '—' : fmt(Math.max(left, 0))}
                    </span>
                  </span>
                  <span className="text-silver/60">{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen && (
                  <div className="mt-1.5 ml-2">
                    <SegmentDetail seg={seg} comp={w.comp} icons={icons} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {w.notes && <div className="mt-3 text-xs text-silver italic">{w.notes}</div>}
      </div>
    </div>
  )
}

export default function Infallible() {
  const data = useData()
  const [wingId, setWingId] = useState(null)
  const inf = data?.infallible
  if (!inf) return <div className="card p-10 text-center">No Infallible data.</div>

  const wing = inf.wings.find((w) => w.id === wingId)
  if (wing) return <WingDetail w={wing} icons={data.icons} onBack={() => setWingId(null)} />

  return (
    <div className="space-y-4">
      <Rules overview={inf.overview} />
      <div className="grid md:grid-cols-2 gap-4">
        {inf.wings.map((w) => (
          <WingCard key={w.id} w={w} onOpen={() => setWingId(w.id)} />
        ))}
      </div>
    </div>
  )
}
