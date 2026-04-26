export type ProjectStatus = "in_progress" | "review_pending" | "complete";

export type ImageStatus =
  | "unreviewed"
  | "candidate"
  | "selected"
  | "excluded"
  | "exported";

export type ImageTag =
  | "cover"
  | "wide"
  | "detail"
  | "material"
  | "space"
  | "process"
  | "archive";

export type AppView =
  | "dashboard"
  | "project"
  | "text"
  | "review"
  | "smartstore";

export type TextChannel =
  | "instagram_caption"
  | "homepage_description"
  | "alt_text";

export type TextTone = "calm" | "warm" | "refined" | "descriptive";
export type TextLength = "short" | "medium" | "long";

export type ExportPresetId =
  | "instagram-feed-4x5"
  | "instagram-square-1x1"
  | "story-9x16"
  | "homepage-thumbnail"
  | "homepage-detail";

export interface ProjectImage {
  id: string;
  name: string;
  shotLabel: string;
  status: ImageStatus;
  tags: ImageTag[];
  isCover: boolean;
  background: string;
  imageUrl?: string;
  sourcePath?: string;
  note: string;
  aiReason?: string;
}

export interface TextConfig {
  channel: TextChannel;
  tone: TextTone;
  length: TextLength;
  mustInclude: string;
  preferred: string;
  forbidden: string;
  reference: string;
}

export interface TextDraft {
  id: string;
  title: string;
  body: string;
  selected: boolean;
}

export interface ExportPreset {
  id: ExportPresetId;
  name: string;
  aspectRatio: string;
  description: string;
  ready: boolean;
}

export interface ReviewItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  category: string;
  shootDate: string;
  status: ProjectStatus;
  notes: string;
  sourceFolderPath?: string;
  exportFolderPath?: string;
  imageIds: string[];
  textConfig: TextConfig;
  drafts: TextDraft[];
  finalText: string;
  exportPresetIds: ExportPresetId[];
  checklist: ReviewItem[];
}

export interface ProjectFormValues {
  name: string;
  client: string;
  category: string;
  shootDate: string;
  status: ProjectStatus;
  notes: string;
  sourceFolderPath: string;
}

export interface StudioPrepData {
  projects: Project[];
  images: Record<string, ProjectImage>;
  exportPresets: ExportPreset[];
}
