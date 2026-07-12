import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import ToastContainer from "../components/toast/ToastContainer";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION = 4000; // ms na tela antes de sumir

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idCounterRef = useRef(0);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = ++idCounterRef.current;

        setToasts(prev => [...prev, { id, type, message }]);

        setTimeout(() => {
            removeToast(id);
        }, TOAST_DURATION);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast precisa ser usado dentro de um <ToastProvider>");
    }

    return context;
}