import { useState, useEffect, useRef } from "react";
import { FaRegCalendarAlt, FaTimes } from "react-icons/fa";

interface Props {
    startDate: string | null;
    endDate: string | null;
    onApply: (startDate: string | null, endDate: string | null) => void;
}

function PurchaseDateFilter({ startDate, endDate, onApply }: Props) {

    const [open, setOpen] = useState(false);
    const [draftStart, setDraftStart] = useState(startDate ?? "");
    const [draftEnd, setDraftEnd] = useState(endDate ?? "");

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

    // sincroniza os drafts caso o filtro seja limpo de fora (ex: troca de aba)
    useEffect(() => {
        setDraftStart(startDate ?? "");
        setDraftEnd(endDate ?? "");
    }, [startDate, endDate]);

    function handleApply() {
        onApply(draftStart || null, draftEnd || null);
        setOpen(false);
    }

    function handleClear() {
        setDraftStart("");
        setDraftEnd("");
        onApply(null, null);
        setOpen(false);
    }

    const hasActiveFilter = Boolean(startDate || endDate);

    return (
        <div className="date-filter-wrapper" ref={wrapperRef}>
            <button
                type="button"
                className={`calendar-btn ${hasActiveFilter ? "calendar-btn-active" : ""}`}
                onClick={() => setOpen(prev => !prev)}
            >
                <FaRegCalendarAlt />
            </button>

            {open && (
                <div className="date-filter-popover">

                    <div className="date-filter-header">
                        <span>Filtrar por data</span>
                        {hasActiveFilter && (
                            <button type="button" className="date-filter-clear" onClick={handleClear}>
                                <FaTimes /> Limpar
                            </button>
                        )}
                    </div>

                    <div className="date-filter-field">
                        <label>De</label>
                        <input
                            type="date"
                            value={draftStart}
                            onChange={e => setDraftStart(e.target.value)}
                        />
                    </div>

                    <div className="date-filter-field">
                        <label>Até</label>
                        <input
                            type="date"
                            value={draftEnd}
                            onChange={e => setDraftEnd(e.target.value)}
                        />
                    </div>

                    <button type="button" className="modal-confirm-btn date-filter-apply" onClick={handleApply}>
                        Aplicar
                    </button>

                </div>
            )}
        </div>
    )
}

export default PurchaseDateFilter