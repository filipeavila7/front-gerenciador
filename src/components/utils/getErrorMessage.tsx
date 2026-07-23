import axios from "axios";

export function getErrorMessage(error: unknown): string {

    if (axios.isAxiosError(error)) {

        const data = error.response?.data;

        if (!data) {
            return "Ocorreu um erro inesperado";
        }


        // Erros padronizados da API
        if (data.erro) {
            return data.erro;
        }


        // Erros de validação (@Valid)
        if (typeof data === "object") {
            return Object.values(data)[0] as string;
        }


        return "Ocorreu um erro inesperado";
    }

    return "Ocorreu um erro inesperado";
}