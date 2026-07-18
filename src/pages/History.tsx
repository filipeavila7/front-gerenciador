import api from "../service/api"
import { useState, useEffect, useRef } from "react"
import { FaChevronLeft, FaChevronRight, FaSearch, FaTrash, FaHistory } from "react-icons/fa"
import { useParams } from "react-router-dom"
import "../styles/page.css"
import "../styles/history.css"
import "../styles/purchaseModals.css"
import type { HistoryResponse } from "../types/history/HistoryResponse"
import type { HistoryAction } from "../types/history/HistoryAction"
import type { HistoryDeleteRequest } from "../types/history/HistoryDeleteRequest"
import { useScrollPosition } from "../hooks/useScrollRestoration"
import type { PageResponse } from "../types/pagination/PageResponse"
import { getErrorMessage } from "../components/utils/GetErrorMessage"
import { useToast } from "../context/ToastContext";
import HistoryActionDropdown from "../components/history/HistoryActionDropdown"
import { HISTORY_ACTION_LABELS } from "../components/history/historyActionMeta"

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 400;

function formatDate(dateTime: string) {
    return new Date(dateTime).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function History() {
    const { showToast } = useToast();

    useScrollPosition("history");
    const { familyId } = useParams();

    const [pageData, setPageData] = useState<PageResponse<HistoryResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [actionFilter, setActionFilter] = useState<HistoryAction | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [deletingSelected, setDeletingSelected] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(0);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        loadHistories(page);
    }, [familyId, page, debouncedSearch, actionFilter]);

    async function loadHistories(pageNumber: number) {
        if (!familyId) return;

        setLoading(true);

        const hasFilter = debouncedSearch.trim().length > 0 || actionFilter !== null;

        try {
            const res = await api.get<PageResponse<HistoryResponse>>(
                hasFilter
                    ? `/history/my/family/${familyId}/search`
                    : `/history/my/family/${familyId}`,
                {
                    params: hasFilter
                        ? {
                              description: debouncedSearch.trim() || undefined,
                              action: actionFilter ?? undefined,
                              page: pageNumber,
                              size: PAGE_SIZE
                          }
                        : {
                              page: pageNumber,
                              size: PAGE_SIZE
                          }
                }
            );

            setPageData(res.data);
            setSelectedIds(new Set());
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    const histories = pageData?.content ?? [];

    function toggleSelect(historyId: number) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(historyId)) next.delete(historyId);
            else next.add(historyId);
            return next;
        });
    }

    function toggleSelectAll() {
        if (selectedIds.size === histories.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(histories.map(h => h.id)));
        }
    }

    async function handleDeleteHistory(historyId: number) {
        if (!familyId) return;
        if (!window.confirm("Excluir este registro do histórico?")) return;

        setDeletingId(historyId);

        try {
            await api.delete(`/history/my/family/${familyId}/history/${historyId}/delete`);
            showToast("success", "Registro excluído.");
            loadHistories(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    }

    async function handleDeleteSelected() {
        if (!familyId || selectedIds.size === 0) return;
        if (!window.confirm(`Excluir ${selectedIds.size} registro(s) do histórico?`)) return;

        setDeletingSelected(true);

        try {
            const payload: HistoryDeleteRequest = { ids: Array.from(selectedIds) };

            await api.delete(`/history/my/family/${familyId}/delete/many`, { data: payload });

            showToast("success", "Registros excluídos.");
            loadHistories(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setDeletingSelected(false);
        }
    }

    return (
        <div className="page-lay">

            <div className="page-header">
                <div className="page-title-box">
                    <h1>Relatórios</h1>
                    <p>Todo histórico de ações dos administradores da família.</p>
                </div>

                <div className="page-header-actions">
                    <div className="page-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Pesquisar relatórios..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="page-toolbar">
                <div className="page-tabs">
                    <HistoryActionDropdown value={actionFilter} onChange={(v) => { setActionFilter(v); setPage(0); }} />
                </div>

                {histories.length > 0 && (
                    <button className="select-all-btn" onClick={toggleSelectAll}>
                        {selectedIds.size === histories.length ? "Desmarcar todos" : "Selecionar todos"}
                    </button>
                )}
            </div>

            {selectedIds.size > 0 && (
                <div className="bulk-action-bar">
                    <span>{selectedIds.size} selecionado(s)</span>
                    <button onClick={handleDeleteSelected} disabled={deletingSelected}>
                        <FaTrash /> {deletingSelected ? "Excluindo..." : "Excluir selecionados"}
                    </button>
                </div>
            )}

            {loading && !pageData ? (
                <div className="history-empty">
                    <p>Carregando relatórios...</p>
                </div>
            ) : histories.length === 0 ? (
                <div className="history-empty">
                    <FaHistory className="empty-icon" />
                    <p>Nenhum registro encontrado.</p>
                </div>
            ) : (
                <div className="history-list">
                    {histories.map(h => {
                        const meta = HISTORY_ACTION_LABELS[h.action];
                        const Icon = meta.icon;
                        const isSelected = selectedIds.has(h.id);
                        const isDeleting = deletingId === h.id;

                        return (
                            <div
                                className={`history-row ${isDeleting ? "history-row-deleting" : ""}`}
                                key={h.id}
                            >

                                <input
                                    type="checkbox"
                                    className="item-checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(h.id)}
                                />

                                <div className={`history-icon-box tone-${meta.tone}`}>
                                    <Icon />
                                </div>

                                <div className="history-info">
                                    <div className="history-info-top">
                                        <span className="history-action-label">{meta.label}</span>
                                        <span className={`history-tone-badge tone-${meta.tone}`}>
                                            {meta.tone === "success" && "Criação"}
                                            {meta.tone === "info" && "Atualização"}
                                            {meta.tone === "danger" && "Exclusão"}
                                            {meta.tone === "warning" && "Ação"}
                                        </span>
                                    </div>
                                    <p className="history-description">{h.description}</p>
                                    <div className="history-meta">
                                        <span className="history-user">{h.userName}</span>
                                        <span className="history-dot">•</span>
                                        <span className="history-date">{formatDate(h.createdAt)}</span>
                                    </div>
                                </div>

                                <button
                                    className="item-action-btn item-action-danger history-delete-btn"
                                    onClick={() => handleDeleteHistory(h.id)}
                                >
                                    <FaTrash />
                                </button>

                            </div>
                        );
                    })}
                </div>
            )}

            {pageData && pageData.totalPages > 1 && (
                <div className="history-pagination">
                    <button
                        onClick={() => setPage(p => Math.max(p - 1, 0))}
                        disabled={pageData.number === 0 || loading}
                    >
                        <FaChevronLeft /> Anterior
                    </button>

                    <span>Página {pageData.number + 1} de {pageData.totalPages}</span>

                    <button
                        onClick={() => setPage(p => Math.min(p + 1, pageData.totalPages - 1))}
                        disabled={pageData.number >= pageData.totalPages - 1 || loading}
                    >
                        Próxima <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    )
}

export default History