
import type { PriorityList } from "./PriorityList";

export interface ListItemUpdateRequest {
  name?: string;
  priority?: PriorityList;
}