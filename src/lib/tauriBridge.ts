import { invoke } from "@tauri-apps/api/core";
import { StudioPrepData } from "../types/domain";

export const tauriStudioPrepBridge = {
  loadStudioPrepData: () => invoke<StudioPrepData>("load_studio_prep_data"),
  saveStudioPrepData: (data: StudioPrepData) =>
    invoke<void>("save_studio_prep_data", { data }),
  resetStudioPrepData: () => invoke<StudioPrepData>("reset_studio_prep_data")
};
