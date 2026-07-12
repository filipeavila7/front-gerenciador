import type { Toast } from "../../context/ToastContext";
import ToastItem from "./ToastItem";
import "../../styles/toast.css";

interface Props {
    toasts: Toast[];
    onDismiss: (id: number) => void;
}

function ToastContainer({ toasts, onDismiss }: Props) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    )
}

export default ToastContainer