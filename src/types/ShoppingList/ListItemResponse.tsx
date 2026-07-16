import type { PriorityList } from "./PriorityList";

export interface ListItemResponse {
  id: number;
  shoppingListId: number;
  familyId: number;
  name: string;
  done: boolean;
  priority: PriorityList;
}