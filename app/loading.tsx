export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f6f4ee] text-[#1d2026]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-black/10 bg-[#24312f] px-4 py-4 text-white sm:px-5 lg:border-b-0 lg:border-r lg:border-white/10 lg:py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/90" />
            <div className="min-w-0 space-y-2">
              <div className="h-3 w-28 rounded bg-white/20" />
              <div className="h-4 w-36 rounded bg-white/35" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-6 lg:grid-cols-1">
            {["", "", "", ""].map((_, index) => (
              <div key={index} className="h-11 rounded-md bg-white/10" />
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-black/10 bg-white/80 px-4 py-4 backdrop-blur sm:px-5 md:px-8">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-black/10" />
              <div className="h-8 w-48 rounded bg-black/10" />
            </div>
          </header>
          <div className="grid gap-4 px-3 py-4 sm:px-5 sm:py-5 md:px-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-44 rounded-lg border border-black/10 bg-white shadow-sm" />
            <div className="h-44 rounded-lg border border-black/10 bg-white shadow-sm" />
            <div className="h-56 rounded-lg border border-black/10 bg-white shadow-sm xl:col-span-2" />
          </div>
        </section>
      </div>
    </main>
  );
}
