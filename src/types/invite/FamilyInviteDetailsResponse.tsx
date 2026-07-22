import type { InviteStatus } from "./InviteStatus";

export interface FamilyInviteDetailsResponse{
    familyName : string;
    createdByName : string;
    expiresAt : string;
    status : InviteStatus;
    familyId : number;
    profileImg : string;
}