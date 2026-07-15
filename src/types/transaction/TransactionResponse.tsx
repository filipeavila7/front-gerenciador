import type { TransactionType } from "./TransactionType";

export interface TransactionResponse {
  id: number;
  familyId: number;
  purchaseId: number | null;
  title: string;
  ammount: number;
  type: TransactionType;
  dateTime: string;
  description: string | null;
}