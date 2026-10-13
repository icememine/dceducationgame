import { Disclaimer } from "@/components/disclaimer";
import { Mascot } from "@/components/mascot";
import type { PlanCard } from "./model";

/** The "Bản kế hoạch đầu tư" card. Same content as the SVG in ./svg.ts. */
export function PlanCardView({ card }: { card: PlanCard }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-line bg-surface">
      <header className="bg-jade px-4 py-3 text-white">
        <p className="font-display text-lg font-extrabold uppercase tracking-wide">Bản kế hoạch đầu tư</p>
        <p className="text-xs font-bold text-jade-soft">Rồng DC Academy</p>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <Mascot mood={card.mascot} size={64} />
          <div>
            <h2 className="text-xl font-extrabold">{card.nickname}</h2>
            <p className="text-xs text-muted">Kế hoạch học và đầu tư của mình</p>
          </div>
        </div>

        <section className="flex flex-col gap-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-muted">Hồ sơ rủi ro</h3>
          {card.profile ? (
            <>
              <p className="text-lg font-extrabold text-jade-deep">{card.profile.name}</p>
              <p className="text-sm">{card.profile.summary}</p>
            </>
          ) : (
            <p className="text-sm text-muted">Chưa xác nhận hồ sơ rủi ro.</p>
          )}
        </section>

        {card.studyTypes.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-muted">Loại quỹ nên tìm hiểu</h3>
            <ul className="flex flex-wrap gap-2">
              {card.studyTypes.map((t) => (
                <li key={t} className="rounded-full bg-sky-soft px-3 py-1 text-xs font-bold text-sky-deep">{t}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-muted">Mục tiêu</h3>
          {card.goals.length === 0 && <p className="text-sm text-muted">Chưa lưu mục tiêu.</p>}
          {card.goals.map((g, i) => (
            <div key={i} className="rounded-xl bg-sunken p-3 text-sm">
              <p className="font-bold">{g.name}</p>
              {!card.hideAmounts && (
                <p className="text-muted">
                  {[g.target, g.monthly, g.duration && `ước tính ${g.duration}`].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          ))}
          {card.moreGoals > 0 && <p className="text-xs text-muted">và {card.moreGoals} mục tiêu khác</p>}
          {card.hideAmounts && <p className="text-xs text-muted">Số tiền đã được ẩn.</p>}
        </section>

        {card.ageRule && (
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-muted">Khung tham khảo</h3>
            <p className="text-sm">{card.ageRule}</p>
          </section>
        )}

        <div className="flex flex-col gap-1 rounded-xl bg-gold-soft p-3">
          <p className="text-sm font-extrabold text-gold-deep">{card.disclaimer}</p>
          <Disclaimer className="text-ink" />
        </div>
      </div>
    </article>
  );
}
