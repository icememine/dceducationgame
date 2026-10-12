/** Shows what the learner is willing to take and, if lower, exactly which answers limited it. */
export function RiskExplanation({ willingName, name, reasons, notes }: { willingName: string; name: string; reasons: string[]; notes: string[] }) {
  if (!reasons.length && !notes.length) return null;
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl bg-gold-soft p-3 text-left text-sm">
      {reasons.length > 0 && (
        <>
          <p>
            Bạn sẵn sàng ở mức <b>{willingName}</b>, nhưng hoàn cảnh hiện tại phù hợp hơn với mức <b>{name}</b>:
          </p>
          <ul className="list-disc pl-5">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </>
      )}
      {notes.map((n) => <p key={n}>{n}</p>)}
    </div>
  );
}
