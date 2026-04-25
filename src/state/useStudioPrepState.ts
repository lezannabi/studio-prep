import { useEffect, useMemo, useState } from "react";
import { isTauriRuntime } from "../lib/runtime";
import { BrowserStudioPrepRepository } from "../repositories/browserStudioPrepRepository";
import { TauriStudioPrepRepository } from "../repositories/tauriStudioPrepRepository";
import {
  applyProjectFormValues,
  createEmptyProjectFormValues,
  createProjectFormValues,
  createProjectFromForm
} from "../services/projectFactory";
import {
  addProjectToData,
  applyRewritePresetInProject,
  deleteProjectFromData,
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

  const syncSelection = (nextData: StudioPrepData, projectId?: string) => {
    const fallbackProject = nextData.projects.find((project) => project.id === projectId) ?? nextData.projects[0];
    setSelectedProjectId(fallbackProject?.id ?? "");
    setSelectedImageId(fallbackProject?.imageIds[0] ?? "");
  };

  const syncEditorFromProject = (project?: Project) => {
    if (!project) {
      setProjectEditorMode("create");
      setProjectForm(createEmptyProjectFormValues());
      return;
    }

    setProjectEditorMode("edit");
    setProjectForm(createProjectFormValues(project));
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
  };

  const startCreateProject = () => {
    setProjectEditorMode("create");
    setProjectForm(createEmptyProjectFormValues());
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

  const createProject = () => {
    if (!data || !projectForm.name.trim()) {
      return;
    }

    const newProject = createProjectFromForm(projectForm);
    const nextData = addProjectToData(data, newProject);
    setData(nextData);
    syncSelection(nextData, newProject.id);
    syncEditorFromProject(newProject);
  };

  const saveProjectMeta = () => {
    if (!data || !selectedProject || !projectForm.name.trim()) {
      return;
    }

    const updatedProject = applyProjectFormValues(selectedProject, projectForm);
    const nextData = updateProjectInData(data, selectedProject.id, () => updatedProject);
    setData(nextData);
    syncSelection(nextData, updatedProject.id);
    syncEditorFromProject(updatedProject);
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
    createProject,
    saveProjectMeta,
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
