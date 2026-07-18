import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../service/api";
import type { PageResponse } from "../types/pagination/PageResponse";
import type { TransactionResponse } from "../types/transaction/TransactionResponse";
import type { TransactionType } from "../types/transaction/TransactionType";
import { getErrorMessage } from "../components/utils/GetErrorMessage";
import { useToast } from "../context/ToastContext";
import PurchaseDateFilter from "../components/purchase/PurchaseDateFilter";
import TransactionSortDropdown from "../components/transactions/TransactionSortDropdown";

import {
    FaSearch,
    FaArrowRight,
    FaChevronLeft,
    FaChevronRight,
    FaArrowUp,
    FaArrowDown,
    FaReceipt,
    FaTimes,
    FaPlus
} from "react-icons/fa";

import "../styles/transactions.css";
import "../styles/purchaseModals.css";
import type { TransactionIncomeRequest } from "../types/transaction/TransactionIncomeRequest";
import { useScrollPosition } from "../hooks/useScrollRestoration";

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 400;

type FilterTab = "TODAS" | "ENTRADAS" | "SAIDAS";

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateTime: string) {
    return new Date(dateTime).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function toIsoDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function Transactions() {
    useScrollPosition("transactions");
    const { familyId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [pageData, setPageData] = useState<PageResponse<TransactionResponse> | null>(null);
    const [newIncome, setNewIncome] = useState<TransactionIncomeRequest>({ title: "", ammount: 0, description: "" });
    const [creating, setCreating] = useState(false);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState<FilterTab>("TODAS");

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [customStartDate, setCustomStartDate] = useState<string | null>(null);
    const [customEndDate, setCustomEndDate] = useState<string | null>(null);

    const [sortValue, setSortValue] = useState("dateTime,desc");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(0);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        loadTransactions(page);
    }, [familyId, page, debouncedSearch, activeTab, customStartDate, customEndDate, sortValue]);

    async function loadTransactions(pageNumber: number) {
        if (!familyId) return;

        setLoading(true);

        const type: TransactionType | undefined =
            activeTab === "ENTRADAS" ? "INCOME" :
                activeTab === "SAIDAS" ? "EXPENSE" :
                    undefined;

        try {
            const res = await api.get<PageResponse<TransactionResponse>>(
                `/transactions/my/family/${familyId}/search`,
                {
                    params: {
                        title: debouncedSearch.trim() || undefined,
                        type,
                        startDate: customStartDate ?? undefined,
                        endDate: customEndDate ?? undefined,
                        page: pageNumber,
                        size: PAGE_SIZE,
                        sort: sortValue
                    }
                }
            );

            setPageData(res.data);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    const transactions = pageData?.content ?? [];

    function handleTabChange(tab: FilterTab) {
        setActiveTab(tab);
        setPage(0);
    }

    function handleDateFilterApply(startDate: string | null, endDate: string | null) {
        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
        setPage(0);
    }

    function openCreateModal() {
        setNewIncome({ title: "", ammount: 0, description: "" });
        setIsCreateOpen(true);
    }

    function closeCreateModal() {
        setIsCreateOpen(false);
    }


    async function handleCreateIncome(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!familyId) return;

        setCreating(true);

        try {
            await api.post(
                `/transactions/new/family/${familyId}`,
                newIncome
            );

            showToast("success", "Transação criada com sucesso!");
            closeCreateModal();
            loadTransactions(page);

        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="transactions-layout">
            {/* ===== modal: criar categoria ===== */}
            {isCreateOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Nova entrada</h2>
                            <button className="modal-close-btn" onClick={closeCreateModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleCreateIncome}>
                                    <input
                                        type="text"
                                        value={newIncome.title}
                                        onChange={(e) =>
                                            setNewIncome({ ...newIncome, title: e.target.value })
                                        }
                                        placeholder="Título da entrada"
                                        required
                                    />

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newIncome.ammount}
                                        onChange={(e) =>
                                            setNewIncome({
                                                ...newIncome,
                                                ammount: Number(e.target.value),
                                            })
                                        }
                                        placeholder="Valor"
                                        required
                                    />

                                    <textarea
                                        value={newIncome.description}
                                        onChange={(e) =>
                                            setNewIncome({
                                                ...newIncome,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Descrição (opcional)"
                                        rows={4}
                                    />



                                    <button className="modal-confirm-btn" type="submit" disabled={creating}>
                                        {creating ? "Criando..." : "Criar entrada"}
                                    </button>

                                    <button type="button" onClick={closeCreateModal} className="modal-cancel-btn">
                                        Cancelar
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="transactions-header">
                <div className="transactions-title-box">
                    <h1>Transações</h1>
                    <p>Acompanhe todas as entradas e saídas da sua família.</p>
                </div>

                <div className="transactions-header-actions">
                    <div className="transactions-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Pesquisar transações..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                        />
                    </div>
                    <button className="new-category-btn" onClick={openCreateModal}>
                        <FaPlus /> Nova entrada
                    </button>
                </div>
            </div>

            <div className="transactions-toolbar">
                <div className="transactions-tabs">
                    <button
                        className={`tab-btn ${activeTab === "TODAS" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("TODAS")}
                    >
                        Todas
                    </button>

                    <button
                        className={`tab-btn ${activeTab === "ENTRADAS" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("ENTRADAS")}
                    >
                        Entradas
                    </button>

                    <button
                        className={`tab-btn ${activeTab === "SAIDAS" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("SAIDAS")}
                    >
                        Saídas
                    </button>
                </div>

                <div className="transactions-sort">
                    <TransactionSortDropdown value={sortValue} onChange={setSortValue} />
                    <PurchaseDateFilter
                        startDate={customStartDate}
                        endDate={customEndDate}
                        onApply={handleDateFilterApply}
                    />
                </div>
            </div>

            {loading && !pageData ? (
                <div className="transactions-empty">
                    <p>Carregando transações...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="transactions-empty">
                    <FaReceipt className="empty-icon" />
                    <p>Nenhuma transação encontrada.</p>
                </div>
            ) : (
                <div className="transactions-list">
                    {transactions.map(t => {
                        const isIncome = t.type === "INCOME";

                        return (
                            <div className="transaction-row" key={t.id}>

                                <div className={`transaction-type-icon ${isIncome ? "type-income" : "type-expense"}`}>
                                    {isIncome ? <FaArrowDown /> : <FaArrowUp />}
                                </div>

                                <div className="transaction-infos">
                                    <span className="transaction-title">{t.title}</span>
                                    <span className="transaction-date">{formatDate(t.dateTime)}</span>
                                    {t.description && (
                                        <span className="transaction-description">{t.description}</span>
                                    )}
                                </div>

                                <div className={`transaction-amount ${isIncome ? "type-income" : "type-expense"}`}>
                                    {isIncome ? "+" : "-"} {formatCurrency(t.ammount)}
                                </div>

                                <button
                                    className="transaction-details-btn"
                                    onClick={() => navigate(`/family/${familyId}/transaction/${t.id}`)}
                                >
                                    Ver detalhes <FaArrowRight />
                                </button>

                            </div>
                        );
                    })}
                </div>
            )}

            {pageData && pageData.totalPages > 1 && (
                <div className="transactions-pagination">
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

export default Transactions