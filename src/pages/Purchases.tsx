import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../service/api";
import type { PageResponse } from "../types/pagination/PageResponse";
import type { PurchaseResponse } from "../types/purchase/PurchaseResponse";
import { getErrorMessage } from "../components/utils/GetErrorMessage";

import {
    FaBoxOpen,
    FaShoppingBag,
    FaShoppingCart,
    FaStar,
    FaRegStar,
    FaSearch,
    FaPlus,
    FaChevronDown,
    FaRegCalendarAlt,
    FaArrowRight,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";

import "../styles/purchases.css";

const PAGE_SIZE = 12;

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

function Purchases() {
    const { familyId } = useParams();
    const navigate = useNavigate();

    const [pageData, setPageData] = useState<PageResponse<PurchaseResponse> | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);

    const [activeTab, setActiveTab] = useState<FilterTab>("TODAS");
    const [search, setSearch] = useState("");
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    async function loadPurchases(pageNumber: number) {
        if (!familyId) return;

        setLoading(true);

        try {
            const res = await api.get<PageResponse<PurchaseResponse>>(
                `/purchase/my/family/${familyId}`,
                {
                    params: {
                        page: pageNumber,
                        size: PAGE_SIZE
                    }
                }
            );

            setPageData(res.data);
        } catch (err) {
            console.log(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPurchases(page);
    }, [familyId, page]);

    function toggleFavorite(id: number) {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    const purchases = pageData?.content ?? [];

    const filteredPurchases = useMemo(() => {
        let result = purchases;

        if (activeTab === "ESTE_MES") {
            const now = new Date();
            result = result.filter(p => {
                const d = new Date(p.dateTime);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
        }

        if (activeTab === "PENDENTES") {
            result = result.filter(p => p.status === "OPEN");
        }

        if (search.trim()) {
            const term = search.trim().toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(term));
        }

        return result;
    }, [purchases, activeTab, search]);

    return (
        <div className="purchases-lay">

            <div className="purchases-header">
                <div className="purchases-title-box">
                    <h1>
                        Compras
                    </h1>
                    <p>Visualize e gerencie todas as compras da sua família.</p>
                </div>

                <div className="purchases-header-actions">
                    <div className="purchases-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Pesquisar compras..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <button
                        className="new-purchase-btn"
                        onClick={() => navigate(`/family/${familyId}/purchases/new`)}
                    >
                        <FaPlus /> Nova compra
                    </button>
                </div>
            </div>

            <div className="purchases-toolbar">
                <div className="purchases-tabs">
                    <button
                        className={`tab-btn ${activeTab === "TODAS" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("TODAS")}
                    >
                        Todas
                    </button>

                    <button
                        className={`tab-btn ${activeTab === "ESTE_MES" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("ESTE_MES")}
                    >
                        Este mês
                    </button>



                    <button
                        className={`tab-btn ${activeTab === "PENDENTES" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("PENDENTES")}
                    >
                        Pendentes
                    </button>
                </div>

                <div className="purchases-sort">
                    <button className="sort-btn">
                        Mais recentes <FaChevronDown />
                    </button>
                    <button className="calendar-btn">
                        <FaRegCalendarAlt />
                    </button>
                </div>
            </div>

            {loading && !pageData ? (
                <div className="purchases-empty">
                    <p>Carregando compras...</p>
                </div>
            ) : filteredPurchases.length === 0 ? (
                <div className="purchases-empty">
                    <p>Nenhuma compra encontrada.</p>
                </div>
            ) : (
                <div className="purchases-grid">
                    {filteredPurchases.map(purchase => {
                        const Icon = getIconForPurchase(purchase.name);
                        const isFavorite = favorites.has(purchase.purchaseId);
                        const isOpen = purchase.status === "OPEN";

                        return (
                            <div className="purchase-card" key={purchase.purchaseId}>

                                <div className="purchase-card-top">
                                    <div className="purchase-icon-box">
                                        <Icon />
                                    </div>

                                    <div className="purchase-card-title">
                                        <h3>{purchase.name}</h3>


                                        <span className={`status-badge ${isOpen ? "status-open" : "status-closed"}`}>
                                            {isOpen ? "Em aberto" : "Concluída"}
                                        </span>
                                    </div>

                                    <button
                                        className="favorite-btn"
                                        onClick={() => toggleFavorite(purchase.purchaseId)}
                                    >
                                        {isFavorite ? <FaStar className="star-filled" /> : <FaRegStar />}
                                    </button>
                                </div>

                                <div className="purchase-total">
                                    {formatCurrency(purchase.total)}
                                </div>

                                <div className="purchase-quantity">
                                    <FaShoppingCart className="quantity-icon" />
                                    {purchase.quantityProducts} produtos
                                </div>

                                <div className="purchase-date">
                                    <FaRegCalendarAlt className="date-icon" />
                                    {formatDate(purchase.dateTime)}
                                </div>

                                <button
                                    className="details-btn"
                                    onClick={() => navigate(
                                        `/family/${familyId}/purchases/${purchase.purchaseId}`,
                                        {
                                            state: {
                                                name: purchase.name,
                                                dateTime: purchase.dateTime,
                                                total: purchase.total,
                                                status: purchase.status
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