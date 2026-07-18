import type { HistoryAction } from "../../types/history/HistoryAction";
import {
    FaWallet,
    FaHome,
    FaTrashAlt,
    FaPen,
    FaShoppingCart,
    FaCheckCircle,
    FaBoxOpen,
    FaUserPlus,
    FaUserMinus,
    FaUserEdit,
    FaSignOutAlt,
    FaTags,
    type IconType
} from "react-icons/fa";

interface HistoryActionMeta {
    label: string;
    icon: IconType;
    tone: "success" | "info" | "danger" | "warning";
}

export const HISTORY_ACTION_LABELS: Record<HistoryAction, HistoryActionMeta> = {
    CREATED_TRANSACTION: { label: "Transação criada", icon: FaWallet, tone: "success" },

    CREATED_FAMILY: { label: "Família criada", icon: FaHome, tone: "success" },
    DELETE_FAMILY: { label: "Família excluída", icon: FaTrashAlt, tone: "danger" },
    UPDATED_FAMILY: { label: "Família atualizada", icon: FaPen, tone: "info" },

    CREATED_PURCHASE: { label: "Compra criada", icon: FaShoppingCart, tone: "success" },
    UPDATED_PURCHASE: { label: "Compra atualizada", icon: FaPen, tone: "info" },
    CLOSE_PURCHASE: { label: "Compra fechada", icon: FaCheckCircle, tone: "warning" },
    DELETED_PURCHASE: { label: "Compra excluída", icon: FaTrashAlt, tone: "danger" },

    CREATED_PRODUCT: { label: "Produto criado", icon: FaBoxOpen, tone: "success" },
    UPDATED_PRODUCT: { label: "Produto atualizado", icon: FaPen, tone: "info" },
    DELETED_PRODUCT: { label: "Produto excluído", icon: FaTrashAlt, tone: "danger" },

    ADDED_MEMBER: { label: "Membro adicionado", icon: FaUserPlus, tone: "success" },
    REMOVED_MEMBER: { label: "Membro removido", icon: FaUserMinus, tone: "danger" },
    CHANGE_MEMBER: { label: "Membro alterado", icon: FaUserEdit, tone: "info" },
    EXIT_MEMBER: { label: "Membro saiu", icon: FaSignOutAlt, tone: "warning" },

    CREATED_CATEGORY: { label: "Categoria criada", icon: FaTags, tone: "success" },
    UPDATED_CATEGORY: { label: "Categoria atualizada", icon: FaPen, tone: "info" },
    DELETED_CATEGORY: { label: "Categoria excluída", icon: FaTrashAlt, tone: "danger" },
};