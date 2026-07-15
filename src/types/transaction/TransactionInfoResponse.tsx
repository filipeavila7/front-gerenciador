import type { TransactionType } from "./TransactionType";
import type { PurchaseItemResponse } from "../purchase/PurchaseItensResponse";

export interface TransactionInfoResponse {
  id: number;
  familyId: number;
  purhcaseId: number | null;
  title: string;
  ammount: number;
  description: string | null;
  date: string;
  type: TransactionType;
  items: PurchaseItemResponse[];
}