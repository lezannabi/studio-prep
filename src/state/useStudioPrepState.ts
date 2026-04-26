import { useEffect, useMemo, useState } from "react";
import { isTauriRuntime } from "../lib/runtime";
import { tauriStudioPrepBridge } from "../lib/tauriBridge";
import { BrowserStudioPrepRepository } from "../repositories/browserStudioPrepRepository";
import { TauriStudioPrepRepository } from "../repositories/tauriStudioPrepRepository";
import {
  applyProjectFormValues,
  createProjectImageBundle,
  createProjectImageBundleFromSources,
  createProjectBundleFromForm,
  createEmptyProjectFormValues,
  createProjectFormValues
} from "../services/projectFactory";
import {
  addProjectToData,
  appendImagesToProjectInData,
  applyRewritePresetInProject,
  deleteProjectFromData,
  removeImageFromProjectInData,
  reorderProjectImagesInData,
  selectDraftInProject,
  setCoverImageInData,
  setImageStatusInData,
  toggleChecklistItemInProject,
  toggleExportPresetReadyInData,
  updateFinalTextInProject,
  updateProjectInData,
  updateTextEnumInProject,
  updateTextFieldInProject
} from "../services/studioPrepEditor";
import {
  AppView,
  ExportPresetId,
  ImageStatus,
  Project,
  ProjectFormValues,
  ProjectImage,
  StudioPrepData,
  TextChannel,
  TextLength,
  TextTone
} from "../types/domain";

type TextField = "mustInclude" | "preferred" | "forbidden" | "reference";
type ImportedProjectBundle = {
  project: Project;
  images: Record<string, ProjectImage>;
  exportPresets?: StudioPrepData["exportPresets"];
};

const repository = isTauriRuntime()
  ? new TauriStudioPrepRepository()
  : new BrowserStudioPrepRepository();

export function useStudioPrepState() {
  const [data, setData] = useState<StudioPrepData | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
  const [projectEditorMode, setProjectEditorMode] = useState<"create" | "edit">("edit");
  const [projectForm, setProjectForm] = useState<ProjectFormValues>(
    createEmptyProjectFormValues()
  );
  const [projectUploadFiles, setProjectUploadFiles] = useState<File[]>([]);
  const [folderSyncError, setFolderSyncError] = useState("");
  const [projectImportError, setProjectImportError] = useState("");
  const [exportFeedback, setExportFeedback] = useState("");

  const syncSelection = (nextData: StudioPrepData, projectId?: string) => {
    const fallbackProject = nextData.projects.find((project) => project.id === projectId) ?? nextData.projects[0];
    setSelectedProjectId(fallbackProject?.id ?? "");
    setSelectedImageId(fallbackProject?.imageIds[0] ?? "");
  };

  const syncEditorFromProject = (project?: Project) => {
    if (!project) {
      setProjectEditorMode("create");
      setProjectForm(createEmptyProjectFormValues());
      setProjectUploadFiles([]);
      setFolderSyncError("");
      setProjectImportError("");
      setExportFeedback("");
      return;
    }

    setProjectEditorMode("edit");
    setProjectForm(createProjectFormValues(project));
    setProjectUploadFiles([]);
    setFolderSyncError("");
    setProjectImportError("");
    setExportFeedback("");
  };

  useEffect(() => {
    let active = true;

    const boot = async () => {
      const loaded = await repository.load();

      if (!active) {
        return;
      }

      setData(loaded);
      syncSelection(loaded);
      syncEditorFromProject(loaded.projects[0]);
      setIsBooting(false);
    };

    void boot();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    void repository.save(data);
  }, [data]);

  const selectedProject = useMemo(
    () => data?.projects.find((project) => project.id === selectedProjectId),
    [data, selectedProjectId]
  );

  const selectedImage = selectedImageId && data ? data.images[selectedImageId] : undefined;

  const projectImages = useMemo(
    () =>
      selectedProject?.imageIds
        .map((imageId) => data?.images[imageId])
        .filter((image): image is ProjectImage => Boolean(image)) ?? [],
    [data, selectedProject]
  );

  const projectPresets = useMemo(
    () =>
      data?.exportPresets.filter((preset) =>
        selectedProject?.exportPresetIds.includes(preset.id)
      ) ?? [],
    [data, selectedProject]
  );

  const selectProject = (projectId: string) => {
    if (!data) {
      return;
    }

    const nextProject = data.projects.find((project) => project.id === projectId);
    if (!nextProject) {
      return;
    }

    setSelectedProjectId(projectId);
    setSelectedImageId(nextProject.imageIds[0] ?? "");
    syncEditorFromProject(nextProject);
  };

  const openProject = (projectId: string, view: AppView = "project") => {
    selectProject(projectId);
    setActiveView(view);
  };

  const updateProject = (
    projectId: string,
    updater: (project: typeof selectedProject) => typeof selectedProject
  ) => {
    setData((current) => {
      if (!current) {
        return current;
      }

      return updateProjectInData(current, projectId, (project) => updater(project)!);
    });
  };

  const setImageStatus = (imageId: string, status: ImageStatus) => {
    setData((current) =>
      current ? setImageStatusInData(current, imageId, status) : current
    );
  };

  const setCoverImage = (projectId: string, imageId: string) => {
    setData((current) =>
      current ? setCoverImageInData(current, projectId, imageId) : current
    );
  };

  const selectDraft = (draftId: string) => {
    if (!selectedProject) {
      return;
    }

    updateProject(selectedProject.id, (project) =>
      project ? selectDraftInProject(project, draftId) : project
    );
  };

  const updateFinalText = (value: string) => {
    if (!selectedProject) {
      return;
    }

    updateProject(selectedProject.id, (project) =>
      project ? updateFinalTextInProject(project, value) : project
    );
  };

  const updateTextEnum = (
    field: "channel" | "tone" | "length",
    value: TextChannel | TextTone | TextLength
  ) => {
    if (!selectedProject) {
      return;
    }

    updateProject(selectedProject.id, (project) =>
      project ? updateTextEnumInProject(project, field, value) : project
    );
  };

  const updateTextField = (field: TextField, value: string) => {
    if (!selectedProject) {
      return;
    }

    updateProject(selectedProject.id, (project) =>
      project ? updateTextFieldInProject(project, field, value) : project
    );
  };

  const applyRewritePreset = (mode: "shorter" | "calmer" | "descriptive" | "preserve") => {
    if (!selectedProject) {
      return;
    }

    updateProject(selectedProject.id, (project) =>
      project ? applyRewritePresetInProject(project, mode) : project
    );
  };

  const toggleChecklistItem = (itemId: string) => {
    if (!selectedProject) {
      return;
    }

    updateProject(selectedProject.id, (project) =>
      project ? toggleChecklistItemInProject(project, itemId) : project
    );
  };

  const markPresetReady = (presetId: ExportPresetId) => {
    setData((current) =>
      current ? toggleExportPresetReadyInData(current, presetId) : current
    );
  };

  const resetSession = async () => {
    const resetData = await repository.reset();
    setData(resetData);
    syncSelection(resetData);
    syncEditorFromProject(resetData.projects[0]);
    setActiveView("dashboard");
    setExportFeedback("");
  };

  const startCreateProject = () => {
    setProjectEditorMode("create");
    setProjectForm(createEmptyProjectFormValues());
    setProjectUploadFiles([]);
    setFolderSyncError("");
    setProjectImportError("");
  };

  const editProjectMeta = (projectId: string) => {
    if (!data) {
      return;
    }

    const project = data.projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    setSelectedProjectId(projectId);
    setSelectedImageId(project.imageIds[0] ?? "");
    syncEditorFromProject(project);
  };

  const updateProjectForm = (field: keyof ProjectFormValues, value: string) => {
    setProjectForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateProjectUploadFiles = (files: File[]) => {
    setProjectUploadFiles(files);
  };

  const importProjectFile = async (file: File) => {
    if (!data) {
      return;
    }

    setProjectImportError("");

    try {
      const raw = await readFileAsText(file);
      const parsed = JSON.parse(raw) as unknown;

      if (isStudioPrepDataShape(parsed)) {
        const importedData = parsed as StudioPrepData;
        setData(importedData);
        syncSelection(importedData);
        syncEditorFromProject(importedData.projects[0]);
        setActiveView("project");
        return;
      }

      if (isImportedProjectBundleShape(parsed)) {
        const nextData = mergeImportedProjectBundle(data, parsed as ImportedProjectBundle);
        setData(nextData);
        syncSelection(nextData, nextData.projects[0]?.id);
        syncEditorFromProject(nextData.projects[0]);
        setActiveView("project");
        return;
      }

      setProjectImportError("지원하지 않는 프로젝트 파일 형식입니다.");
    } catch (error) {
      setProjectImportError(
        error instanceof Error ? error.message : "프로젝트 파일을 불러오지 못했습니다."
      );
    }
  };

  const createProject = async () => {
    if (!data || !projectForm.name.trim()) {
      return;
    }

    setFolderSyncError("");

    const { project: newProject, images: uploadedImages } = await createProjectBundleFromForm(
      projectForm,
      projectUploadFiles
    );
    let nextImages = uploadedImages;

    if (isTauriRuntime() && projectForm.sourceFolderPath.trim()) {
      try {
        const folderImages = await tauriStudioPrepBridge.scanProjectFolderImages(
          projectForm.sourceFolderPath.trim()
        );
        const importedFolderImages = createProjectImageBundleFromSources(
          newProject.id,
          folderImages,
          Object.keys(uploadedImages).length
        );
        nextImages = {
          ...uploadedImages,
          ...importedFolderImages
        };
        newProject.imageIds = Object.keys(nextImages);
      } catch (error) {
        setFolderSyncError(error instanceof Error ? error.message : "폴더를 불러오지 못했습니다.");
      }
    }

    const nextData = addProjectToData(data, newProject, nextImages);
    setData(nextData);
    syncSelection(nextData, newProject.id);
    syncEditorFromProject(newProject);
  };

  const saveProjectMeta = async () => {
    if (!data || !selectedProject || !projectForm.name.trim()) {
      return;
    }

    setFolderSyncError("");

    const updatedProject = applyProjectFormValues(selectedProject, projectForm);
    let nextData = updateProjectInData(data, selectedProject.id, () => updatedProject);

    if (projectUploadFiles.length > 0) {
      const images = await createProjectImageBundle(
        selectedProject.id,
        projectUploadFiles,
        selectedProject.imageIds.length
      );
      nextData = appendImagesToProjectInData(nextData, selectedProject.id, images);
    }

    setData(nextData);
    syncSelection(nextData, updatedProject.id);
    syncEditorFromProject(updatedProject);
  };

  const syncProjectFolderImages = async () => {
    if (!data || !selectedProject || !projectForm.sourceFolderPath.trim() || !isTauriRuntime()) {
      return;
    }

    setFolderSyncError("");

    try {
      const folderImages = await tauriStudioPrepBridge.scanProjectFolderImages(
        projectForm.sourceFolderPath.trim()
      );
      let nextData = updateProjectInData(data, selectedProject.id, (project) => ({
        ...project,
        sourceFolderPath: projectForm.sourceFolderPath.trim()
      }));
      const existingSourcePaths = new Set(
        selectedProject.imageIds
          .map((imageId) => data.images[imageId]?.sourcePath)
          .filter((value): value is string => Boolean(value))
      );
      const newSources = folderImages.filter(
        (image) => image.sourcePath && !existingSourcePaths.has(image.sourcePath)
      );

      if (newSources.length === 0) {
        setData(nextData);
        return;
      }

      const images = createProjectImageBundleFromSources(
        selectedProject.id,
        newSources,
        selectedProject.imageIds.length
      );
      nextData = appendImagesToProjectInData(nextData, selectedProject.id, images);
      setData(nextData);
      syncSelection(nextData, selectedProject.id);
      syncEditorFromProject(
        nextData.projects.find((project) => project.id === selectedProject.id)
      );
    } catch (error) {
      setFolderSyncError(error instanceof Error ? error.message : "폴더를 불러오지 못했습니다.");
    }
  };

  const removeProjectImage = (imageId: string) => {
    if (!data || !selectedProject) {
      return;
    }

    const nextData = removeImageFromProjectInData(data, selectedProject.id, imageId);
    setData(nextData);

    const nextProject = nextData.projects.find((project) => project.id === selectedProject.id);
    const nextSelectedImageId =
      selectedImageId === imageId ? (nextProject?.imageIds[0] ?? "") : selectedImageId;

    setSelectedImageId(nextSelectedImageId);
    syncEditorFromProject(nextProject);
  };

  const reorderProjectImages = (sourceImageId: string, targetImageId: string) => {
    if (!data || !selectedProject) {
      return;
    }

    const nextData = reorderProjectImagesInData(
      data,
      selectedProject.id,
      sourceImageId,
      targetImageId
    );
    setData(nextData);
  };

  const executeProjectExport = async () => {
    if (!selectedProject) {
      return;
    }

    setExportFeedback("");

    if (!isTauriRuntime()) {
      setExportFeedback("내보내기 실행은 데스크톱 앱(Tauri)에서만 지원됩니다.");
      return;
    }

    const readyPresets = projectPresets.filter((preset) => preset.ready);
    const imagesForExport = selectImagesForExport(projectImages);

    if (readyPresets.length === 0) {
      setExportFeedback("준비된 내보내기 프리셋이 없습니다.");
      return;
    }

    if (imagesForExport.length === 0) {
      setExportFeedback("내보낼 이미지가 없습니다.");
      return;
    }

    try {
      const result = await tauriStudioPrepBridge.exportProjectAssets({
        projectName: selectedProject.name,
        sourceFolderPath: selectedProject.sourceFolderPath,
        exportFolderPath: selectedProject.exportFolderPath,
        images: imagesForExport,
        presets: readyPresets
      });

      setExportFeedback(
        `${result.exportedPresetCount}개 프리셋으로 ${result.exportedImageCount}장 내보내기 완료: ${result.exportPath}`
      );
    } catch (error) {
      setExportFeedback(
        error instanceof Error ? error.message : "내보내기 실행 중 오류가 발생했습니다."
      );
    }
  };

  const pickProjectExportFolder = async () => {
    if (!selectedProject || !data || !isTauriRuntime()) {
      return;
    }

    try {
      const folderPath = await tauriStudioPrepBridge.pickExportFolder();

      if (!folderPath) {
        return;
      }

      const nextProject = {
        ...selectedProject,
        exportFolderPath: folderPath
      };
      const nextData = updateProjectInData(data, selectedProject.id, () => nextProject);
      setData(nextData);
      syncEditorFromProject(nextProject);
      setExportFeedback(`내보내기 폴더 선택: ${folderPath}`);
    } catch (error) {
      setExportFeedback(
        error instanceof Error ? error.message : "내보내기 폴더를 선택하지 못했습니다."
      );
    }
  };

  const deleteProject = () => {
    if (!data || !selectedProject) {
      return;
    }

    const nextData = deleteProjectFromData(data, selectedProject.id);
    setData(nextData);
    syncSelection(nextData);
    syncEditorFromProject(nextData.projects[0]);
  };

  return {
    activeView,
    data,
    isBooting,
    projectImages,
    projectPresets,
    selectedImage,
    selectedImageId,
    selectedProject,
    selectedProjectId,
    setActiveView,
    setCoverImage,
    setImageStatus,
    setSelectedImageId,
    selectDraft,
    selectProject,
    projectEditorMode,
    projectForm,
    startCreateProject,
    editProjectMeta,
    updateProjectForm,
    updateProjectUploadFiles,
    projectUploadFiles,
    folderSyncError,
    projectImportError,
    exportFeedback,
    importProjectFile,
    createProject,
    saveProjectMeta,
    syncProjectFolderImages,
    removeProjectImage,
    reorderProjectImages,
    executeProjectExport,
    pickProjectExportFolder,
    deleteProject,
    openProject,
    updateFinalText,
    updateTextEnum,
    updateTextField,
    applyRewritePreset,
    toggleChecklistItem,
    markPresetReady,
    resetSession
  };
}

function selectImagesForExport(images: ProjectImage[]) {
  const selected = images.filter((image) => image.status === "selected" || image.isCover);

  if (selected.length > 0) {
    return selected;
  }

  const candidates = images.filter((image) => image.status === "candidate");
  if (candidates.length > 0) {
    return candidates;
  }

  const exportable = images.filter((image) => image.status !== "excluded");
  if (exportable.length > 0) {
    return exportable;
  }

  return images;
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("파일을 읽지 못했습니다."));
    reader.readAsText(file);
  });
}

function isStudioPrepDataShape(value: unknown): value is StudioPrepData {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray((value as StudioPrepData).projects) &&
      typeof (value as StudioPrepData).images === "object" &&
      Array.isArray((value as StudioPrepData).exportPresets)
  );
}

function isImportedProjectBundleShape(value: unknown): value is ImportedProjectBundle {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as ImportedProjectBundle).project === "object" &&
      typeof (value as ImportedProjectBundle).images === "object"
  );
}

function mergeImportedProjectBundle(
  data: StudioPrepData,
  bundle: ImportedProjectBundle
): StudioPrepData {
  const projectId = createUniqueId(bundle.project.id, new Set(data.projects.map((project) => project.id)));
  const imageIdMap = new Map<string, string>();
  const usedImageIds = new Set(Object.keys(data.images));

  for (const imageId of bundle.project.imageIds) {
    imageIdMap.set(imageId, createUniqueId(imageId, usedImageIds));
  }

  const importedImages = Object.fromEntries(
    bundle.project.imageIds
      .map((imageId) => {
        const image = bundle.images[imageId];
        const nextImageId = imageIdMap.get(imageId);

        if (!image || !nextImageId) {
          return null;
        }

        return [
          nextImageId,
          {
            ...image,
            id: nextImageId
          }
        ] as const;
      })
      .filter((entry): entry is readonly [string, ProjectImage] => Boolean(entry))
  );

  const importedProject: Project = {
    ...bundle.project,
    id: projectId,
    imageIds: bundle.project.imageIds
      .map((imageId) => imageIdMap.get(imageId))
      .filter((imageId): imageId is string => Boolean(imageId))
  };

  return {
    ...data,
    projects: [importedProject, ...data.projects],
    images: {
      ...data.images,
      ...importedImages
    },
    exportPresets: mergeExportPresets(data.exportPresets, bundle.exportPresets ?? [])
  };
}

function mergeExportPresets(
  currentPresets: StudioPrepData["exportPresets"],
  importedPresets: StudioPrepData["exportPresets"]
) {
  const presetMap = new Map(currentPresets.map((preset) => [preset.id, preset]));

  for (const preset of importedPresets) {
    if (!presetMap.has(preset.id)) {
      presetMap.set(preset.id, preset);
    }
  }

  return Array.from(presetMap.values());
}

function createUniqueId(id: string, usedIds: Set<string>) {
  if (!usedIds.has(id)) {
    usedIds.add(id);
    return id;
  }

  let suffix = 1;
  let nextId = `${id}-${suffix}`;

  while (usedIds.has(nextId)) {
    suffix += 1;
    nextId = `${id}-${suffix}`;
  }

  usedIds.add(nextId);
  return nextId;
}
