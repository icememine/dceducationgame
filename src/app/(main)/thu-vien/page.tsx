import { Search } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, entriesIn, searchLibrary, type CategoryId, type LibraryEntry } from "@content/library";

export const metadata = { title: "Thư viện hỏi đáp" };

function Entry({ e, open }: { e: LibraryEntry; open?: boolean }) {
  return (
    <details open={open} className="group rounded-2xl border-2 border-line p-3 [&_summary::-webkit-details-marker]:hidden">
      <summary className="cursor-pointer list-none font-bold">{e.q}</summary>
      <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed">{e.a}</p>
    </details>
  );
}

/** Browse or search the Q&A library that also grounds Hỏi Rồng. Server-rendered; search is a plain GET form. */
export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q = "", cat } = await searchParams;
  const query = q.trim();
  const hits = query ? searchLibrary(query, 8) : [];
  const category = cat && cat in CATEGORIES ? (cat as CategoryId) : undefined;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-extrabold">Thư viện hỏi đáp</h1>
        <p className="text-sm text-muted">Phí, thuế, lịch giao dịch, tài khoản và các quỹ của DC. Không tìm thấy? <Link className="font-bold text-sky-deep" href="/rong">Hỏi Rồng</Link></p>
      </div>
      <form className="flex items-center gap-2 rounded-2xl border-2 border-line bg-sunken px-3 focus-within:border-sky" action="/thu-vien">
        <Search className="h-5 w-5 text-muted" />
        <input name="q" defaultValue={query} placeholder="Ví dụ: phí bán sau 2 năm" aria-label="Tìm trong thư viện" className="w-full bg-transparent py-3 outline-none" />
      </form>

      {query ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted">Kết quả cho “{query}”</h2>
          {hits.length ? hits.map((e, i) => <Entry key={e.id} e={e} open={i === 0} />) : <p className="text-sm">Chưa có câu phù hợp. Anh/chị thử hỏi Rồng hoặc dùng từ khóa khác.</p>}
        </section>
      ) : category ? (
        <section className="flex flex-col gap-2">
          <Link href="/thu-vien" className="text-sm font-bold text-sky-deep">← Tất cả chủ đề</Link>
          <h2 className="text-lg font-extrabold">{CATEGORIES[category].title}</h2>
          {entriesIn(category).map((e) => <Entry key={e.id} e={e} />)}
        </section>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {(Object.keys(CATEGORIES) as CategoryId[]).map((id) => (
            <li key={id}>
              <Link href={`/thu-vien?cat=${id}`} className="flex h-full flex-col gap-1 rounded-2xl border-2 border-line p-3 font-bold">
                {CATEGORIES[id].title}
                <span className="text-xs font-semibold text-muted">{entriesIn(id).length} câu hỏi</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
