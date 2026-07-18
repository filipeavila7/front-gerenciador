import { useState, useEffect, useRef } from "react";
import type { HistoryAction } from "../../types/history/HistoryAction";
import { FaChevronDown } from "react-icons/fa";
import { HISTORY_ACTION_LABELS } from "./historyActionMeta";

interface Props {
    value: HistoryAction | null;
    onChange: (value: HistoryAction | null) => void;
}

const ACTIONS: HistoryAction[] = [
    "CREATED_TRANSACTION",
    "CREATED_FAMILY", "DELETE_FAMILY", "UPDATED_FAMILY",
    "CREATED_PURCHASE", "UPDATED_PURCHASE", "CLOSE_PURCHASE", "DELETED_PURCHASE",
    "CREATED_PRODUCT", "UPDATED_PRODUCT", "DELETED_PRODUCT",
    "ADDED_MEMBER", "REMOVED_MEMBER", "CHANGE_MEMBER", "EXIT_MEMBER",
    "CREATED_CATEGORY", "UPDATED_CATEGORY", "DELETED_CATEGORY",
];

function HistoryActionDropdown({ value, onChange }: Props) {

    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const currentLabel = value ? HISTORY_ACTION_LABELS[value].label : "Todas as ações";

    return (
        <div className="sort-dropdown-wrapper" ref={wrapperRef}>
            <button type="button" className="sort-btn" onClick={() => setOpen(prev => !prev)}>
                {currentLabel} <FaChevronDown className={open ? "chevron-open" : ""} />
            </button>

            {open && (
                <div className="sort-dropdown-menu history-action-menu">
                    <button
                        type="button"
                        className={`action-menu-item ${!value ? "category-option-selected" : ""}`}
                        onClick={() => { onChange(null); setOpen(false); }}
                    >
                        Todas as ações
                    </button>

                    {ACTIONS.map(action => (
                        <button
                            key={action}
                            type="button"
                            className={`action-menu-item ${action === value ? "category-option-selected" : ""}`}
                            onClick={() => { onChange(action); setOpen(false); }}
                        >
                            {HISTORY_ACTION_LABELS[action].label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default HistoryActionDropdown