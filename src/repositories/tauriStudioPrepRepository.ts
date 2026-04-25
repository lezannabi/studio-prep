import { StudioPrepData } from "../types/domain";
import { tauriStudioPrepBridge } from "../lib/tauriBridge";
import { StudioPrepRepository } from "./studioPrepRepository";

export class TauriStudioPrepRepository implements StudioPrepRepository {
  async load(): Promise<StudioPrepData> {
    return tauriStudioPrepBridge.loadStudioPrepData();
  }

  async save(data: StudioPrepData): Promise<void> {
    await tauriStudioPrepBridge.saveStudioPrepData(data);
  }

  async reset(): Promise<StudioPrepData> {
    return tauriStudioPrepBridge.resetStudioPrepData();
  }
}
