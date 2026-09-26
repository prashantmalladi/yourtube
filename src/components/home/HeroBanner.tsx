export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-100 via-lime-100 to-emerald-100 p-8 dark:from-amber-950/50 dark:via-lime-950/40 dark:to-emerald-950/50 sm:p-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 text-4xl opacity-30">
        <span className="absolute left-6 top-6">🐾</span>
        <span className="absolute right-10 top-10">🐾</span>
        <span className="absolute bottom-8 left-1/3">🐾</span>
        <span className="absolute right-1/4 bottom-6">❤️</span>
      </div>

      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="max-w-md font-serif text-3xl leading-tight font-bold text-amber-900 sm:text-4xl dark:text-amber-200">
            A Happier World with Dogs
          </h1>
        </div>

        <div className="hidden text-4xl sm:flex sm:gap-2">
          <span>🐕</span>
          <span>🐩</span>
          <span>🐕‍🦺</span>
          <span>🦮</span>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Good Dogs
            <br />
            Brighter Days
          </p>
          <button className="mt-2 rounded-full bg-amber-900 px-5 py-2 text-sm font-medium text-amber-50 hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-300">
            Subscribe for more wagging tails!
          </button>
        </div>
      </div>
    </div>
  );
}
