import axios from "axios";

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.erro 
            ?? "Ocorreu um erro inesperado";
    }

    return "Ocorreu um erro inesperado";
}