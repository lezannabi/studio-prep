import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { ExportPreset, ProjectImage, StudioPrepData } from "../types/domain";

interface TauriFolderImageRecord {
  name: string;
  path: string;
}

interface ExportProjectPayload {
  projectName: string;
  sourceFolderPath?: string;
  exportFolderPath?: string;
  images: Array<
    Pick<ProjectImage, "name" | "imageUrl" | "sourcePath" | "status" | "isCover">
  >;
  presets: Array<Pick<ExportPreset, "id" | "name">>;
}

interface ExportProjectResult {
  exportPath: string;
  exportedImageCount: number;
  exportedPresetCount: number;
}

interface AnalyzeProjectPayload {
  projectName: string;
  notes: string;
  images: Array<
    Pick<ProjectImage, "id" | "name" | "imageUrl" | "sourcePath" | "note" | "tags">
  >;
}

interface AnalyzeProjectResult {
  coverImageId: string;
  decisions: Array<{
    imageId: string;
    status: "selected" | "candidate" | "excluded";
    reason: string;
  }>;
}

export const tauriStudioPrepBridge = {
  loadStudioPrepData: () => invoke<StudioPrepData>("load_studio_prep_data"),
  saveStudioPrepData: (data: StudioPrepData) =>
    invoke<void>("save_studio_prep_data", { data }),
  resetStudioPrepData: () => invoke<StudioPrepData>("reset_studio_prep_data"),
  scanProjectFolderImages: async (folderPath: string) => {
    const images = await invoke<TauriFolderImageRecord[]>("scan_project_folder_images", {
      folderPath
    });

    return images.map((image) => ({
      name: image.name,
      sourcePath: image.path,
      imageUrl: convertFileSrc(image.path)
    }));
  },
  exportProjectAssets: (payload: ExportProjectPayload) =>
    invoke<ExportProjectResult>(
      "export_project_assets",
      payload as unknown as Record<string, unknown>
    ),
  pickExportFolder: () => invoke<string | null>("pick_export_folder"),
  analyzeProjectImages: (payload: AnalyzeProjectPayload) =>
    invoke<AnalyzeProjectResult>("analyze_project_images", {
      payload: {
        projectName: payload.projectName,
        notes: payload.notes,
        images: payload.images.map((image) => ({
          imageId: image.id,
          name: image.name,
          imageUrl: image.imageUrl,
          sourcePath: image.sourcePath,
          note: image.note,
          tags: image.tags
        }))
      }
    })
};
