import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../service/api";
import {
    clearRefreshTokenCookie,
    setRefreshTokenCookie
} from "../service/authCookie";
import type { UserResponse } from "../types/user/UserResponse";


interface AuthContextType {

    user: UserResponse | null;

    authenticated: boolean;

    loading: boolean;

    login: (accessToken: string, refreshToken: string) => Promise<void>;

    logout: () => Promise<void>;

}



const AuthContext = createContext<AuthContextType | null>(null);



export function AuthProvider({
    children
}: {
    children: React.ReactNode
}) {


    const [user, setUser] = useState<UserResponse | null>(null);

    const [loading, setLoading] = useState(true);



    async function loadUser() {

        const token = localStorage.getItem("token");


        if (!token) {

            setUser(null);
            setLoading(false);
            return;

        }


        try {

            const response = await api.get<UserResponse>(
                "/users/me"
            );


            setUser(response.data);


        } catch {

            localStorage.removeItem("token");

            setUser(null);


        } finally {

            setLoading(false);

        }

    }


    async function login(
        accessToken: string,
        refreshToken: string
    ) {

        localStorage.setItem(
            "token",
            accessToken
        );

        setRefreshTokenCookie(refreshToken);

        setLoading(true);

        await loadUser();

    }



    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUser();

    }, []);



    async function logout() {

        try {

            await api.post(
                "/auth/logout"
            );

        } finally {

            localStorage.removeItem("token");

            clearRefreshTokenCookie();

            setUser(null);

        }

    }



    return (

        <AuthContext.Provider
            value={{
                user,
                authenticated: !!user,
                loading,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}



// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {


    const context = useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth deve ser usado dentro do AuthProvider"
        );

    }


    return context;

}
