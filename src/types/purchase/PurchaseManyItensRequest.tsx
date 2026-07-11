import type { PurchaseItensRequest } from "./PurchaseItensRequest";

export interface PurchaseManyItensRequest {
  itensRequests: PurchaseItensRequest[];
}