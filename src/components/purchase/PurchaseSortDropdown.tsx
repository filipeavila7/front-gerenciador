import { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";

export interface SortOption {
    label: string;
    value: string; // formato aceito pelo Pageable do Spring: "campo,direcao"
}

const SORT_OPTIONS: SortOption[] = [
    { label: "Mais recentes", value: "dateTime,desc" },
    { label: "Mais antigas", value: "dateTime,asc" },
    { label: "Maior valor", value: "total,desc" },
    { label: "Menor valor", value: "total,asc" },
    { label: "Nome A-Z", value: "name,asc" },
];

interface Props {
    value: string;
    onChange: (value: string) => void;
}

function PurchaseSortDropdown({ value, onChange }: Props) {

    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const currentLabel = SORT_OPTIONS.find(opt => opt.value === value)?.label ?? "Ordenar";

    return (
        <div className="sort-dropdown-wrapper" ref={wrapperRef}>
            <button type="button" className="sort-btn" onClick={() => setOpen(prev => !prev)}>
                {currentLabel} <FaChevronDown className={open ? "chevron-open" : ""} />
            </button>

            {open && (
                <div className="sort-dropdown-menu">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`action-menu-item ${opt.value === value ? "category-option-selected" : ""}`}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PurchaseSortDropdown