export function LoadingScreen() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="rounded-[28px] border border-white/70 bg-white/80 px-8 py-7 text-center shadow-[0_24px_80px_rgba(33,42,39,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
          Studio Prep
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          Dummy Session Loading
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          저장된 프로토타입 세션과 더미 데이터를 불러오는 중입니다.
        </p>
      </div>
    </div>
  );
}
