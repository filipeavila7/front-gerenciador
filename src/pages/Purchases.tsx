import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../service/api";
import type { PageResponse } from "../types/pagination/PageResponse";
import type { PurchaseResponse, PurchaseStatus } from "../types/purchase/PurchaseResponse";
import type { PurchaseRequest } from "../types/purchase/PurchaseRequest";
import type { PurchaseUpdateRequest } from "../types/purchase/PurchaseUpdateRequest";
import type { PurchaseTransactionRequest } from "../types/purchase/PurchaseTransactionRequest";
import { getErrorMessage } from "../components/utils/GetErrorMessage";
import { HiDotsVertical } from "react-icons/hi";
import { useToast } from "../context/ToastContext";
import PurchaseDateFilter from "../components/purchase/PurchaseDateFilter";
import PurchaseSortDropdown from "../components/purchase/PurchaseSortDropdown";

import {
    FaBoxOpen,
    FaShoppingBag,
    FaShoppingCart,
    FaStar,
    FaRegStar,
    FaSearch,
    FaPlus,
    FaArrowRight,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
    FaPen,
    FaTrash,
    FaCheckCircle,
    FaRegCalendarAlt
} from "react-icons/fa";

import "../styles/purchases.css";

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 400;

type FilterTab = "TODAS" | "ESTE_MES" | "PENDENTES";

const CARD_ICONS = [FaBoxOpen, FaShoppingBag, FaShoppingCart];

function getIconForPurchase(name: string) {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CARD_ICONS[hash % CARD_ICONS.length];
}

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

// yyyy-mm-dd, formato aceito pelo @DateTimeFormat(iso = ISO.DATE) do Spring
function toIsoDate(date: Date) {
    return date.toISOString().split("T")[0];
}

function getFirstDayOfMonth() {
    const now = new Date();
    return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function getLastDayOfMonth() {
    const now = new Date();
    return toIsoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
}

function Purchases() {
    const { familyId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // ===== modal: criar compra =====
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchase, setPurchase] = useState<PurchaseRequest>({ name: "" });

    // ===== dropdown de ações (⋮) por card =====
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const actionMenuRef = useRef<HTMLDivElement | null>(null);

    // ===== modal: editar compra =====
    const [editingPurchase, setEditingPurchase] = useState<PurchaseResponse | null>(null);
    const [editName, setEditName] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    // ===== modal: fechar compra =====
    const [closingPurchase, setClosingPurchase] = useState<PurchaseResponse | null>(null);
    const [closeDescription, setCloseDescription] = useState("");
    const [closingSubmitting, setClosingSubmitting] = useState(false);

    // ===== exclusão =====
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // ===== listagem/filtros =====
    const [pageData, setPageData] = useState<PageResponse<PurchaseResponse> | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);

    const [activeTab, setActiveTab] = useState<FilterTab>("TODAS");

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // filtro de data manual (calendário) — quando preenchido, tem prioridade sobre o preset "Este mês"
    const [customStartDate, setCustomStartDate] = useState<string | null>(null);
    const [customEndDate, setCustomEndDate] = useState<string | null>(null);

    const [sortValue, setSortValue] = useState("dateTime,desc");

    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    // fecha o dropdown de ações ao clicar fora dele
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionId(null);
            }
        }

        if (openActionId !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openActionId]);

    // debounce da busca por nome
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(0);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // recarrega sempre que qualquer filtro/página/ordenação mudar
    useEffect(() => {
        loadPurchases(page);
    }, [familyId, page, debouncedSearch, activeTab, customStartDate, customEndDate, sortValue]);

    async function loadPurchases(pageNumber: number) {
        if (!familyId) return;

        setLoading(true);

        // status vem do tab "Pendentes"; os outros tabs não filtram por status
        const status: PurchaseStatus | undefined = activeTab === "PENDENTES" ? "OPEN" : undefined;

        // regra de prioridade: se o usuário escolheu datas manualmente no calendário,
        // elas sobrescrevem o preset "Este mês" do tab
        let startDate: string | undefined;
        let endDate: string | undefined;

        if (customStartDate || customEndDate) {
            startDate = customStartDate ?? undefined;
            endDate = customEndDate ?? undefined;
        } else if (activeTab === "ESTE_MES") {
            startDate = getFirstDayOfMonth();
            endDate = getLastDayOfMonth();
        }

        try {
            const res = await api.get<PageResponse<PurchaseResponse>>(
                `/purchase/my/family/${familyId}/search`,
                {
                    params: {
                        name: debouncedSearch.trim() || undefined,
                        status,
                        startDate,
                        endDate,
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

    const purchases = pageData?.content ?? [];

    function toggleFavorite(id: number) {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function handleTabChange(tab: FilterTab) {
        setActiveTab(tab);
        setPage(0);

        // trocar de aba limpa o filtro manual de data, pra não conflitar com o preset
        if (tab !== "ESTE_MES") {
            setCustomStartDate(null);
            setCustomEndDate(null);
        }
    }

    function handleDateFilterApply(startDate: string | null, endDate: string | null) {
        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
        setPage(0);

        // usar o calendário manualmente sai do preset "Este mês", já que agora
        // o intervalo é escolhido à mão
        if ((startDate || endDate) && activeTab === "ESTE_MES") {
            setActiveTab("TODAS");
        }
    }

    // ===== criar compra =====
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    async function createPurchase(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId) return;

        try {
            await api.post(`/purchase/new/family/${familyId}`, purchase);
            closeModal();
            loadPurchases(page);
            setPurchase({ name: "" });
            showToast("success", "Compra criada com sucesso!");
        } catch (err) {
            showToast("error", getErrorMessage(err));
        }
    }

    // ===== dropdown de ações =====
    function toggleActionMenu(purchaseId: number) {
        setOpenActionId(prev => (prev === purchaseId ? null : purchaseId));
    }

    // ===== editar compra =====
    function startEdit(p: PurchaseResponse) {
        setEditingPurchase(p);
        setEditName(p.name);
        setOpenActionId(null);
    }

    function closeEditModal() {
        setEditingPurchase(null);
        setEditName("");
    }

    async function handleUpdatePurchase(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId || !editingPurchase) return;

        setSavingEdit(true);

        try {
            const payload: PurchaseUpdateRequest = { name: editName };

            await api.put(
                `/purchase/update/family/${familyId}/purchase/${editingPurchase.purchaseId}`,
                payload
            );

            closeEditModal();
            loadPurchases(page);
            showToast("success", "Compra editada com sucesso!");
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setSavingEdit(false);
        }
    }

    // ===== fechar compra =====
    function startClose(p: PurchaseResponse) {
        setClosingPurchase(p);
        setCloseDescription("");
        setOpenActionId(null);
    }

    function closeCloseModal() {
        setClosingPurchase(null);
        setCloseDescription("");
    }

    async function handleClosePurchase(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId || !closingPurchase) return;

        setClosingSubmitting(true);

        try {
            const payload: PurchaseTransactionRequest = {
                description: closeDescription.trim() || undefined
            };

            await api.patch(
                `/purchase/close/family/${familyId}/purchase/${closingPurchase.purchaseId}`,
                payload
            );

            closeCloseModal();
            loadPurchases(page);
            showToast("success", "Compra fechada com sucesso!");
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setClosingSubmitting(false);
        }
    }

    // ===== excluir compra =====
    async function handleDeletePurchase(purchaseId: number) {
        if (!familyId) return;
        if (!window.confirm("Excluir essa compra e todos os itens dela?")) return;

        setOpenActionId(null);
        setDeletingId(purchaseId);

        try {
            await api.delete(`/purchase/delete/family/${familyId}/purchase/${purchaseId}`);
            loadPurchases(page);
            showToast("success", "Compra excluída com sucesso!");
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="purchases-lay">

            {/* ===== modal: criar compra ===== */}
            {isModalOpen && (
                <div onClick={closeModal} className="modal-overlay">
                    <div onClick={(e) => e.stopPropagation()} className="modal-box-2">
                        <div className="modal-header">
                            <h2>Nova compra</h2>
                            <button className="modal-close-btn" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={createPurchase}>
                                    <input
                                        type="text"
                                        value={purchase.name}
                                        onChange={(e) =>
                                            setPurchase({ ...purchase, name: e.target.value })
                                        }
                                        placeholder="Nome da compra"
                                        required
                                    />

                                    <button className="modal-confirm-btn" type="submit">
                                        Criar compra
                                    </button>

                                    <button type="button" onClick={closeModal} className="modal-cancel-btn">
                                        Cancelar
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== modal: editar compra ===== */}
            {editingPurchase && (
                <div className="modal-overlay">
                    <div className="modal-box-2">
                        <div className="modal-header">
                            <h2>Editar compra</h2>
                            <button className="modal-close-btn" onClick={closeEditModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleUpdatePurchase}>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Nome da compra"
                                        minLength={3}
                                        maxLength={25}
                                        required
                                    />

                                    <button className="modal-confirm-btn" type="submit" disabled={savingEdit}>
                                        {savingEdit ? "Salvando..." : "Salvar alterações"}
                                    </button>

                                    <button type="button" onClick={closeEditModal} className="modal-cancel-btn">
                                        Cancelar
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== modal: fechar compra ===== */}
            {closingPurchase && (
                <div className="modal-overlay">
                    <div className="modal-box-2">
                        <div className="modal-header">
                            <h2>Fechar compra</h2>
                            <button className="modal-close-btn" onClick={closeCloseModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">

                                {closingPurchase.quantityProducts === 0 ? (
                                    <>
                                        <p className="close-purchase-blocked">
                                            <FaBoxOpen className="blocked-icon" />
                                            Essa compra ainda não tem produtos. Adicione ao menos um produto
                                            antes de fechá-la.
                                        </p>

                                        <button
                                            type="button"
                                            className="modal-confirm-btn"
                                            onClick={() => {
                                                closeCloseModal();
                                                navigate(
                                                    `/family/${familyId}/purchases/${closingPurchase.purchaseId}`,
                                                    {
                                                        state: {
                                                            name: closingPurchase.name,
                                                            dateTime: closingPurchase.dateTime,
                                                            total: closingPurchase.total,
                                                            status: closingPurchase.status
                                                        }
                                                    }
                                                );
                                            }}
                                        >
                                            Adicionar produtos
                                        </button>

                                        <button type="button" onClick={closeCloseModal} className="modal-cancel-btn">
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="close-purchase-warning">
                                            Ao fechar <strong>{closingPurchase.name}</strong>, ela não poderá mais ser
                                            editada e uma transação de <strong>{formatCurrency(closingPurchase.total)}</strong> será
                                            criada automaticamente.
                                        </p>

                                        <form className="purchase-form" onSubmit={handleClosePurchase}>
                                            <label className="purchase-form-label">
                                                Descrição da transação
                                                <span className="optional-tag">opcional</span>
                                            </label>

                                            <textarea
                                                value={closeDescription}
                                                onChange={(e) => setCloseDescription(e.target.value)}
                                                placeholder="Ex: Compra do mês, mercado da semana..."
                                                rows={3}
                                            />

                                            <button
                                                className="modal-confirm-btn modal-confirm-btn-close"
                                                type="submit"
                                                disabled={closingSubmitting}
                                            >
                                                {closingSubmitting ? "Fechando..." : (
                                                    <>
                                                        <FaCheckCircle /> Fechar compra
                                                    </>
                                                )}
                                            </button>

                                            <button type="button" onClick={closeCloseModal} className="modal-cancel-btn">
                                                Cancelar
                                            </button>
                                        </form>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="purchases-header">
                <div className="purchases-title-box">
                    <h1>Compras</h1>
                    <p>Visualize e gerencie todas as compras da sua família.</p>
                </div>

                <div className="purchases-header-actions">
                    <div className="purchases-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Pesquisar compras..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                        />
                    </div>

                    <button className="new-purchase-btn" onClick={openModal}>
                        <FaPlus /> Nova compra
                    </button>
                </div>
            </div>

            <div className="purchases-toolbar">
                <div className="purchases-tabs">
                    <button
                        className={`tab-btn ${activeTab === "TODAS" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("TODAS")}
                    >
                        Todas
                    </button>

                    <button
                        className={`tab-btn ${activeTab === "ESTE_MES" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("ESTE_MES")}
                    >
                        Este mês
                    </button>

                    <button
                        className={`tab-btn ${activeTab === "PENDENTES" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("PENDENTES")}
                    >
                        Pendentes
                    </button>
                </div>

                <div className="purchases-sort">
                    <PurchaseSortDropdown value={sortValue} onChange={setSortValue} />
                    <PurchaseDateFilter
                        startDate={customStartDate}
                        endDate={customEndDate}
                        onApply={handleDateFilterApply}
                    />
                </div>
            </div>

            {loading && !pageData ? (
                <div className="purchases-empty">
                    <p>Carregando compras...</p>
                </div>
            ) : purchases.length === 0 ? (
                <div className="purchases-empty">
                    <p>Nenhuma compra encontrada.</p>
                </div>
            ) : (
                <div className="purchases-grid">
                    {purchases.map(p => {
                        const Icon = getIconForPurchase(p.name);
                        const isFavorite = favorites.has(p.purchaseId);
                        const isOpen = p.status === "OPEN";
                        const isMenuOpen = openActionId === p.purchaseId;
                        const isDeleting = deletingId === p.purchaseId;

                        return (
                            <div
                                className={`purchase-card ${isDeleting ? "purchase-card-deleting" : ""}`}
                                key={p.purchaseId}
                            >

                                <div className="purchase-card-top">
                                    <div className="purchase-icon-box">
                                        <Icon />
                                    </div>

                                    <div className="purchase-card-title">
                                        <h3>{p.name}</h3>
                                        <span className={`status-badge ${isOpen ? "status-open" : "status-closed"}`}>
                                            {isOpen ? "Em aberto" : "Concluída"}
                                        </span>
                                    </div>

                                    <div className="purchase-dots-box">
                                        <button
                                            className="favorite-btn"
                                            onClick={() => toggleFavorite(p.purchaseId)}
                                        >
                                            {isFavorite ? <FaStar className="star-filled" /> : <FaRegStar />}
                                        </button>

                                        <div className="purchase-action-wrapper">
                                            <button
                                                className="favorite-btn"
                                                onClick={() => toggleActionMenu(p.purchaseId)}
                                            >
                                                <HiDotsVertical />
                                            </button>

                                            {isMenuOpen && (
                                                <div className="purchase-action-menu" ref={actionMenuRef}>
                                                    {isOpen ? (
                                                        <>
                                                            <button
                                                                className="action-menu-item"
                                                                onClick={() => startEdit(p)}
                                                            >
                                                                <FaPen /> Editar
                                                            </button>
                                                            <button
                                                                className="action-menu-item action-menu-success"
                                                                onClick={() => {
                                                                    setOpenActionId(null);
                                                                    if (p.quantityProducts === 0) {
                                                                        showToast("error", "Essa compra não tem produtos. Adicione ao menos um antes de fechar.");
                                                                        return;
                                                                    }
                                                                    startClose(p);
                                                                }}
                                                            >
                                                                <FaCheckCircle /> Fechar compra
                                                            </button>
                                                            <button
                                                                className="action-menu-item action-menu-danger"
                                                                onClick={() => handleDeletePurchase(p.purchaseId)}
                                                            >
                                                                <FaTrash /> Excluir
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="action-menu-item"
                                                            onClick={() => navigate(
                                                                `/family/${familyId}/purchases/${p.purchaseId}`,
                                                                {
                                                                    state: {
                                                                        name: p.name,
                                                                        dateTime: p.dateTime,
                                                                        total: p.total,
                                                                        status: p.status
                                                                    }
                                                                }
                                                            )}
                                                        >
                                                            <FaArrowRight /> Ver detalhes
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="purchase-total">
                                    {formatCurrency(p.total)}
                                </div>

                                <div className="purchase-quantity">
                                    <FaShoppingCart className="quantity-icon" />
                                    {p.quantityProducts} produtos
                                </div>

                                <div className="purchase-date">
                                    <FaRegCalendarAlt className="date-icon" />
                                    {formatDate(p.dateTime)}
                                </div>

                                <button
                                    className="details-btn"
                                    onClick={() => navigate(
                                        `/family/${familyId}/purchases/${p.purchaseId}`,
                                        {
                                            state: {
                                                name: p.name,
                                                dateTime: p.dateTime,
                                                total: p.total,
                                                status: p.status
                                            }
                                        }
                                    )}
                                >
                                    {isOpen ? "Editar compra" : "Ver detalhes"} <FaArrowRight />
                                </button>

                            </div>
                        );
                    })}
                </div>
            )}

            {pageData && pageData.totalPages > 1 && (
                <div className="purchases-pagination">
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

export default Purchases