export type PurchaseStatus = "OPEN" | "CLOSED"


export interface PurchaseResponse{
    purchaseId : number;
    name : string;
    familyId : number;
    dateTime : string;
    type : PurchaseStatus;
    quantityProducts : number;
    total : number

}