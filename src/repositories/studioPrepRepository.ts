import { StudioPrepData } from "../types/domain";

export interface StudioPrepRepository {
  load(): Promise<StudioPrepData>;
  save(data: StudioPrepData): Promise<void>;
  reset(): Promise<StudioPrepData>;
}
