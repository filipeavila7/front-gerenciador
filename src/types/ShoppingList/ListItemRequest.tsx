import type { PriorityList } from "./PriorityList";

export interface ListItemRequest {
  name: string;
  done: boolean;
  priority: PriorityList;
}