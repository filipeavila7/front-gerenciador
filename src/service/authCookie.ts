const REFRESH_TOKEN_COOKIE = "refreshToken";


export function setRefreshTokenCookie(refreshToken: string) {

    document.cookie =
        `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}; path=/; SameSite=Lax`;

}


export function clearRefreshTokenCookie() {

    document.cookie =
        `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;

}
