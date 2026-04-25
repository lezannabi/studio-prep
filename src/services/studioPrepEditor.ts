import {
  ExportPresetId,
  ImageStatus,
  Project,
  ProjectImage,
  ProjectFormValues,
  StudioPrepData,
  TextChannel,
  TextLength,
  TextTone
} from "../types/domain";

type TextField = "mustInclude" | "preferred" | "forbidden" | "reference";

export function updateProjectInData(
  data: StudioPrepData,
  projectId: string,
  updater: (project: Project) => Project
): StudioPrepData {
  return {
    ...data,
    projects: data.projects.map((project) =>
      project.id === projectId ? updater(project) : project
    )
  };
}

export function addProjectToData(
  data: StudioPrepData,
  project: Project
): StudioPrepData {
  return {
    ...data,
    projects: [project, ...data.projects]
  };
}

export function deleteProjectFromData(
  data: StudioPrepData,
  projectId: string
): StudioPrepData {
  return {
    ...data,
    projects: data.projects.filter((project) => project.id !== projectId)
  };
}

export function updateImageInData(
  data: StudioPrepData,
  imageId: string,
  updater: (image: ProjectImage) => ProjectImage
): StudioPrepData {
  return {
    ...data,
    images: {
      ...data.images,
      [imageId]: updater(data.images[imageId])
    }
  };
}

export function setImageStatusInData(
  data: StudioPrepData,
  imageId: string,
  status: ImageStatus
): StudioPrepData {
  return updateImageInData(data, imageId, (image) => ({ ...image, status }));
}

export function setCoverImageInData(
  data: StudioPrepData,
  projectId: string,
  imageId: string
): StudioPrepData {
  const project = data.projects.find((item) => item.id === projectId);

  if (!project) {
    return data;
  }

  return project.imageIds.reduce(
    (nextData, projectImageId) =>
      updateImageInData(nextData, projectImageId, (image) => ({
        ...image,
        isCover: projectImageId === imageId
      })),
    data
  );
}

export function selectDraftInProject(project: Project, draftId: string): Project {
  return {
    ...project,
    drafts: project.drafts.map((draft) => ({
      ...draft,
      selected: draft.id === draftId
    })),
    finalText:
      project.drafts.find((draft) => draft.id === draftId)?.body ?? project.finalText
  };
}

export function updateFinalTextInProject(project: Project, value: string): Project {
  return {
    ...project,
    finalText: value
  };
}

export function updateTextEnumInProject(
  project: Project,
  field: "channel" | "tone" | "length",
  value: TextChannel | TextTone | TextLength
): Project {
  return {
    ...project,
    textConfig: {
      ...project.textConfig,
      [field]: value
    }
  };
}

export function updateTextFieldInProject(
  project: Project,
  field: TextField,
  value: string
): Project {
  return {
    ...project,
    textConfig: {
      ...project.textConfig,
      [field]: value
    }
  };
}

export function applyRewritePresetInProject(
  project: Project,
  mode: "shorter" | "calmer" | "descriptive" | "preserve"
): Project {
  const suffixMap = {
    shorter: " 더 짧은 문장 흐름으로 정리해 둔 프로토타입 버전입니다.",
    calmer: " 보다 담백하고 차분한 톤으로 눌러 쓴 프로토타입 버전입니다.",
    descriptive: " 설명 밀도를 높여 맥락을 더 분명하게 잡은 프로토타입 버전입니다.",
    preserve: " 포함 단어를 유지한 채 구조만 다시 정리한 프로토타입 버전입니다."
  } as const;

  return {
    ...project,
    finalText: `${project.finalText.split(".")[0] || project.finalText}.${suffixMap[mode]}`
  };
}

export function toggleChecklistItemInProject(project: Project, itemId: string): Project {
  return {
    ...project,
    checklist: project.checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    )
  };
}

export function toggleExportPresetReadyInData(
  data: StudioPrepData,
  presetId: ExportPresetId
): StudioPrepData {
  return {
    ...data,
    exportPresets: data.exportPresets.map((preset) =>
      preset.id === presetId ? { ...preset, ready: !preset.ready } : preset
    )
  };
}
