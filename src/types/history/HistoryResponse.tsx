import type { HistoryAction } from "./HistoryAction";


export interface HistoryResponse{
    id : number;
    familyId : number;
    familyName : string;
    userId : number;
    userName : string;
    description : string;
    action : HistoryAction;
    createdAt : string;
}