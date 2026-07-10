export type PurchaseStatus = "OPEN" | "CLOSED"


export interface PurchaseResponse{
    purchaseId : number;
    name : string;
    familyId : number;
    dateTime : string;
    status : PurchaseStatus;
    quantityProducts : number;
    total : number

}