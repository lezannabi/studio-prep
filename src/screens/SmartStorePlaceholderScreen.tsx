import { Panel } from "../components/ui";

export function SmartStorePlaceholderScreen() {
  return (
    <Panel title="스마트스토어 상세페이지 Placeholder" subtitle="Phase 2">
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          "세로형 상세 섹션 시퀀스",
          "제품 포인트 블록",
          "상세페이지 전용 카피"
        ].map((item) => (
          <div
            key={item}
            className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-5"
          >
            <h3 className="text-base font-semibold text-stone-900">{item}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              2차 확장에서 실제 상세페이지용 이미지 조합, 문장 프리셋, 템플릿 편집
              흐름을 여기에 연결합니다.
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
