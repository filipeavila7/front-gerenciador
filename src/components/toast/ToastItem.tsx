import type { Toast } from "../../context/ToastContext";
import {
    FaCheckCircle,
    FaExclamationCircle,
    FaInfoCircle,
    FaExclamationTriangle,
    FaTimes
} from "react-icons/fa";

interface Props {
    toast: Toast;
    onDismiss: (id: number) => void;
}

const ICONS = {
    success: FaCheckCircle,
    error: FaExclamationCircle,
    info: FaInfoCircle,
    warning: FaExclamationTriangle,
};

function ToastItem({ toast, onDismiss }: Props) {
    const Icon = ICONS[toast.type];

    return (
        <div className={`toast-item toast-${toast.type}`}>
            <Icon className="toast-icon" />
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => onDismiss(toast.id)}>
                <FaTimes />
            </button>
        </div>
    )
}

export default ToastItem