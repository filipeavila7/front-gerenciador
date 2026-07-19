import type { FamilyRole } from "./FamilyRole";

export interface MemberResponse{
    id : number;
    name : string;
    profileImg : string;
    role : FamilyRole;
    joinedAt : string
}