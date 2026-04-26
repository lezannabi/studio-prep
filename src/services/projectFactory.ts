import {
  ExportPresetId,
  Project,
  ProjectFormValues,
  ProjectImage,
  ProjectStatus
} from "../types/domain";

const defaultChecklist = [
  { id: "cover", label: "대표컷 확정", checked: false },
  { id: "order", label: "이미지 순서 점검", checked: false },
  { id: "text", label: "최종 문안 교정", checked: false },
  { id: "preset", label: "채널별 프리셋 검토", checked: false }
] as const;

const defaultPresetIds: ExportPresetId[] = [
  "instagram-feed-4x5",
  "homepage-thumbnail"
];

export interface ImportedImageSource {
  name: string;
  imageUrl?: string;
  sourcePath?: string;
}

export function createEmptyProjectFormValues(): ProjectFormValues {
  return {
    name: "",
    client: "",
    category: "",
    shootDate: new Date().toISOString().slice(0, 10),
    status: "in_progress",
    notes: "",
    sourceFolderPath: ""
  };
}

export function createProjectFormValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    client: project.client,
    category: project.category,
    shootDate: project.shootDate,
    status: project.status,
    notes: project.notes,
    sourceFolderPath: project.sourceFolderPath ?? ""
  };
}

export function createProjectFromForm(values: ProjectFormValues): Project {
  const id = `project-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    name: values.name.trim(),
    client: values.client.trim(),
    category: values.category.trim(),
    shootDate: values.shootDate,
    status: values.status,
    notes: values.notes.trim(),
    sourceFolderPath: values.sourceFolderPath.trim(),
    imageIds: [],
    textConfig: {
      channel: "instagram_caption",
      tone: "calm",
      length: "medium",
      mustInclude: "",
      preferred: "",
      forbidden: "",
      reference: ""
    },
    drafts: [
      {
        id: `${id}-draft-1`,
        title: "Draft 1",
        body: "프로젝트 설명 초안 1",
        selected: true
      },
      {
        id: `${id}-draft-2`,
        title: "Draft 2",
        body: "프로젝트 설명 초안 2",
        selected: false
      },
      {
        id: `${id}-draft-3`,
        title: "Draft 3",
        body: "프로젝트 설명 초안 3",
        selected: false
      }
    ],
    finalText: "",
    exportPresetIds: defaultPresetIds,
    checklist: defaultChecklist.map((item) => ({ ...item }))
  };
}

export async function createProjectBundleFromForm(
  values: ProjectFormValues,
  files: File[]
): Promise<{ project: Project; images: Record<string, ProjectImage> }> {
  const project = createProjectFromForm(values);
  const images = await createProjectImages(project.id, files);

  return {
    project: {
      ...project,
      imageIds: Object.keys(images)
    },
    images
  };
}

export async function createProjectImageBundle(
  projectId: string,
  files: File[],
  startIndex = 0
): Promise<Record<string, ProjectImage>> {
  const sources = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      imageUrl: await readFileAsDataUrl(file)
    }))
  );

  return createProjectImagesFromSources(projectId, sources, startIndex);
}

export function createProjectImageBundleFromSources(
  projectId: string,
  sources: ImportedImageSource[],
  startIndex = 0
): Record<string, ProjectImage> {
  return createProjectImagesFromSources(projectId, sources, startIndex);
}

export function applyProjectFormValues(
  project: Project,
  values: ProjectFormValues
): Project {
  return {
    ...project,
    name: values.name.trim(),
    client: values.client.trim(),
    category: values.category.trim(),
    shootDate: values.shootDate,
    status: values.status as ProjectStatus,
    notes: values.notes.trim(),
    sourceFolderPath: values.sourceFolderPath.trim()
  };
}

async function createProjectImages(projectId: string, files: File[], startIndex = 0) {
  const sources = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      imageUrl: await readFileAsDataUrl(file)
    }))
  );

  return createProjectImagesFromSources(projectId, sources, startIndex);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

function createShotLabel(fileName: string, index: number) {
  const baseName = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();

  if (!baseName) {
    return `Upload ${index + 1}`;
  }

  return baseName
    .split(/\s+/)
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createImageFallbackBackground(seed: string) {
  let hash = 0;

  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  const hueA = hash % 360;
  const hueB = (hueA + 42) % 360;

  return `linear-gradient(135deg, hsla(${hueA}, 34%, 58%, 0.92), hsla(${hueB}, 28%, 24%, 0.86))`;
}

function createProjectImagesFromSources(
  projectId: string,
  sources: ImportedImageSource[],
  startIndex = 0
) {
  const imageEntries = sources.map((source, index) => {
    const sequence = startIndex + index + 1;
    const imageId = `${projectId}-image-${sequence}`;
    const isFirstImage = sequence === 1;

    return [
      imageId,
      {
        id: imageId,
        name: source.name,
        shotLabel: createShotLabel(source.name, sequence - 1),
        status: isFirstImage ? "selected" : "unreviewed",
        tags: isFirstImage ? ["cover", "detail"] : ["archive"],
        isCover: isFirstImage,
        background: createImageFallbackBackground(source.name),
        imageUrl: source.imageUrl,
        sourcePath: source.sourcePath,
        note: source.sourcePath
          ? "연결 폴더에서 불러온 이미지"
          : isFirstImage
            ? "업로드한 대표컷 후보"
            : "업로드한 신규 이미지"
      } satisfies ProjectImage
    ] as const;
  });

  return Object.fromEntries(imageEntries);
}
