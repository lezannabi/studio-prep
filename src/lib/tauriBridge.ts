import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { StudioPrepData } from "../types/domain";

interface TauriFolderImageRecord {
  name: string;
  path: string;
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
  }
};
