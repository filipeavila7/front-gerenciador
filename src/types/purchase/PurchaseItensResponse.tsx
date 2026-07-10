export interface PurchaseItemResponse {
  purchaseId: number;
  familyId: number;
  productId: number;
  productName: string;
  categoryName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}