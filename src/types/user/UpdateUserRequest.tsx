export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
    profileImg?: string;
    newPassword? : string;
}