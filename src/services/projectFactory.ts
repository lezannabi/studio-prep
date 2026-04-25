import { ExportPresetId, Project, ProjectFormValues, ProjectStatus } from "../types/domain";

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

export function createEmptyProjectFormValues(): ProjectFormValues {
  return {
    name: "",
    client: "",
    category: "",
    shootDate: new Date().toISOString().slice(0, 10),
    status: "in_progress",
    notes: ""
  };
}

export function createProjectFormValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    client: project.client,
    category: project.category,
    shootDate: project.shootDate,
    status: project.status,
    notes: project.notes
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
    notes: values.notes.trim()
  };
}
