import {
  AppView,
  ImageStatus,
  ImageTag,
  ProjectStatus,
  TextChannel,
  TextLength,
  TextTone
} from "../types/domain";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  in_progress: "진행 중",
  review_pending: "검수 대기",
  complete: "완료"
};

export const imageStatusLabels: Record<ImageStatus, string> = {
  unreviewed: "미검토",
  candidate: "후보",
  selected: "선택",
  excluded: "제외",
  exported: "내보내기 완료"
};

export const imageTagLabels: Record<ImageTag, string> = {
  cover: "대표컷",
  wide: "전경",
  detail: "디테일컷",
  material: "재료컷",
  space: "공간컷",
  process: "과정컷",
  archive: "보관용"
};

export const channelLabels: Record<TextChannel, string> = {
  instagram_caption: "Instagram Caption",
  homepage_description: "Homepage Description",
  alt_text: "Alt Text"
};

export const toneLabels: Record<TextTone, string> = {
  calm: "차분하게",
  warm: "따뜻하게",
  refined: "정제되게",
  descriptive: "설명형"
};

export const lengthLabels: Record<TextLength, string> = {
  short: "짧게",
  medium: "중간",
  long: "길게"
};

export const viewLabels: Record<AppView, string> = {
  dashboard: "대시보드",
  project: "프로젝트 상세",
  text: "텍스트 생성/편집",
  review: "검수/내보내기",
  smartstore: "스마트스토어"
};
