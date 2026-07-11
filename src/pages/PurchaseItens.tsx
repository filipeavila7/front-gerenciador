import { useParams } from "react-router-dom";
import api from "../service/api";
import { useState, useEffect, useRef } from "react";

import type { PurchaseItemResponse } from "../types/purchase/PurchaseItensResponse";
import type { PurchaseResponse } from "../types/purchase/PurchaseResponse";
import type { PageResponse } from "../types/pagination/PageResponse";
import type { DeleteManyRequest } from "../types/purchase/DeleteManyRequest";

import { getErrorMessage } from "../components/utils/GetErrorMessage";
import AddProductModal from "../components/modals/AddProductModal";
import EditItemModal from "../components/modals/EditItemModal";
import { useNavigate } from "react-router-dom";

import {
    FaUtensils,
    FaHome,
    FaCar,
    FaHeartbeat,
    FaGamepad,
    FaArrowLeft,
    FaGraduationCap,
    FaPlane,
    FaFilm,
    FaDumbbell,
    FaGift,
    FaWallet,
    FaTshirt,
    FaPaw,
    FaEllipsisH,
    FaChevronLeft,
    FaChevronRight,
    FaBoxOpen,
    FaPlus,
    FaPen,
    FaTrash,
    FaMinus
} from "react-icons/fa";

import "../styles/purchases.css";
import "../styles/purchaseModals.css";

const CATEGORY_ICONS = [
    FaUtensils, FaHome, FaCar, FaHeartbeat, FaGamepad, FaGraduationCap,
    FaPlane, FaFilm, FaDumbbell, FaGift, FaWallet, FaTshirt, FaPaw, FaEllipsisH,
];

function getIconForCategory(name: string) {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CATEGORY_ICONS[hash % CATEGORY_ICONS.length];
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateTime: string) {
    return new Date(dateTime).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

function PurchaseItens() {

    const { familyId, purchaseId } = useParams();
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState<PurchaseResponse | null>(null);
    const [pageData, setPageData] = useState<PageResponse<PurchaseItemResponse> | null>(null);

    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingPurchase, setLoadingPurchase] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [deleting, setDeleting] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PurchaseItemResponse | null>(null);

    const requestIdRef = useRef(0);

    async function loadPurchase() {
        if (!familyId || !purchaseId) return;

        setLoadingPurchase(true);

        try {
            const res = await api.get<PurchaseResponse>(
                `/purchase/my/family/${familyId}/purchase/${purchaseId}`
            );
            setPurchase(res.data);
        } catch (err) {
            console.log(getErrorMessage(err));
        } finally {
            setLoadingPurchase(false);
        }
    }

    async function loadItens() {
        if (!familyId || !purchaseId) return;

        setLoading(true);
        setErrorMsg(null);

        const currentRequestId = ++requestIdRef.current;

        try {
            const res = await api.get<PageResponse<PurchaseItemResponse>>(
                `/purchase/my/family/${familyId}/purchase/${purchaseId}/itens`,
                { params: { page, size: 12 } }
            );

            if (currentRequestId === requestIdRef.current) {
                setPageData(res.data);
                setSelectedIds(new Set());
            }
        } catch (err) {
            setErrorMsg(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadPurchase(); }, [familyId, purchaseId]);
    useEffect(() => { loadItens(); }, [familyId, purchaseId, page]);

    const items = pageData?.content ?? [];
    const canEdit = purchase?.status === "OPEN";

    function toggleSelect(productId: number) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(productId)) next.delete(productId);
            else next.add(productId);
            return next;
        });
    }

    async function handleDeleteOne(productId: number) {
        if (!familyId || !purchaseId) return;
        if (!window.confirm("Remover esse produto da compra?")) return;

        try {
            await api.delete(
                `/purchase/delete/family/${familyId}/purchase/${purchaseId}/product/${productId}`
            );
            loadItens();
            loadPurchase();
        } catch (err) {
            setErrorMsg(getErrorMessage(err));
        }
    }


    const [updatingQty, setUpdatingQty] = useState<number | null>(null);

    async function handleQuickQuantityChange(item: PurchaseItemResponse, delta: number) {
        if (!familyId || !purchaseId) return;

        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return; // não deixa zerar por aqui — pra remover, usa a lixeira

        setUpdatingQty(item.productId);

        try {
            await api.put(
                `/purchase/update/family/${familyId}/purchase/${purchaseId}/product/${item.productId}`,
                {
                    quantity: newQuantity,
                    unitPrice: item.unitPrice
                }
            );

            loadItens();
            loadPurchase();
        } catch (err) {
            setErrorMsg(getErrorMessage(err));
        } finally {
            setUpdatingQty(null);
        }
    }

    async function handleDeleteSelected() {
        if (!familyId || !purchaseId || selectedIds.size === 0) return;
        if (!window.confirm(`Remover ${selectedIds.size} produto(s) da compra?`)) return;

        setDeleting(true);

        try {
            const payload: DeleteManyRequest = { ids: Array.from(selectedIds) };

            await api.delete(
                `/purchase/delete/family/${familyId}/purchase/${purchaseId}/product/many`,
                { data: payload }
            );

            loadItens();
            loadPurchase();
        } catch (err) {
            setErrorMsg(getErrorMessage(err));
        } finally {
            setDeleting(false);
        }
    }

    function handleMutated() {
        loadItens();
        loadPurchase();
    }

    return (
        <div className="purchase-itens-page">
            <div className="purchase-itens-lay">

                <div className="purchase-itens-header">
                    <div className="purchase-itens-title">
                        <div onClick={()=> navigate(-1)} className="voltar-box">
                            <FaArrowLeft className="voltar-icon" />
                        </div>
                        <h2>{purchase?.name ?? "Itens da compra"}</h2>
                        {purchase?.dateTime && (
                            <span className="purchase-itens-date">{formatDate(purchase.dateTime)}</span>
                        )}
                    </div>

                    {purchase && (
                        <div className="purchase-itens-total">
                            <span className="total-label">Total</span>
                            <span className="total-value">{formatCurrency(purchase.total)}</span>
                        </div>
                    )}
                </div>

                <div className="purchase-itens-toolbar">
                    {purchase && (
                        <div className={`purchase-status ${canEdit ? "status-open" : "status-closed"}`}>
                            {canEdit ? "Em aberto" : "Concluída"}
                        </div>
                    )}

                    {canEdit && (
                        <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
                            <FaPlus /> Adicionar produto
                        </button>
                    )}
                </div>

                {canEdit && selectedIds.size > 0 && (
                    <div className="bulk-action-bar">
                        <span>{selectedIds.size} selecionado(s)</span>
                        <button onClick={handleDeleteSelected} disabled={deleting}>
                            <FaTrash /> {deleting ? "Removendo..." : "Excluir selecionados"}
                        </button>
                    </div>
                )}

                {pageData && (
                    <div className="purchase-itens-count">
                        {pageData.totalElements} {pageData.totalElements === 1 ? "produto" : "produtos"}
                    </div>
                )}

                {errorMsg ? (
                    <div className="purchase-itens-empty"><p>{errorMsg}</p></div>
                ) : loading && !pageData ? (
                    <div className="purchase-itens-empty"><p>Carregando produtos...</p></div>
                ) : items.length === 0 ? (
                    <div className="purchase-itens-empty">
                        <FaBoxOpen className="empty-icon" />
                        <p>Nenhum produto encontrado nessa compra.</p>
                    </div>
                ) : (
                    <div className={`purchase-itens-list ${loading ? "list-loading" : ""}`}>
                        {items.map(item => {
                            const Icon = getIconForCategory(item.categoryName);
                            const isSelected = selectedIds.has(item.productId);

                            return (
                                <div
                                    className={`purchase-item-row ${canEdit ? "item-row-editable" : ""}`}
                                    key={item.productId}
                                >
                                    {canEdit && (
                                        <input
                                            type="checkbox"
                                            className="item-checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(item.productId)}
                                        />
                                    )}

                                    <div className="item-icon-box">
                                        <Icon />
                                    </div>

                                    <div className="item-info">
                                        <span className="item-name">{item.productName}</span>
                                        <span className="item-category">{item.categoryName}</span>
                                    </div>

                                    <div className="item-quantity">{item.quantity}x</div>
                                    <div className="item-unit-price">{formatCurrency(item.unitPrice)}</div>
                                    <div className="item-subtotal">{formatCurrency(item.subtotal)}</div>

                                    {canEdit && (
                                        <div className="item-actions">

                                            <div className="qty-quick-actions">
                                                <button
                                                    className="qty-quick-btn"
                                                    onClick={() => handleQuickQuantityChange(item, -1)}
                                                    disabled={updatingQty === item.productId || item.quantity <= 1}
                                                >
                                                    <FaMinus />
                                                </button>
                                                <button
                                                    className="qty-quick-btn"
                                                    onClick={() => handleQuickQuantityChange(item, 1)}
                                                    disabled={updatingQty === item.productId}
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>

                                            <button
                                                className="item-action-btn"
                                                onClick={() => setEditingItem(item)}
                                            >
                                                <FaPen />
                                            </button>
                                            <button
                                                className="item-action-btn item-action-danger"
                                                onClick={() => handleDeleteOne(item.productId)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {pageData && pageData.totalPages > 1 && (
                    <div className="purchase-itens-pagination">
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

            {showAddModal && familyId && purchaseId && (
                <AddProductModal
                    familyId={familyId}
                    purchaseId={purchaseId}
                    existingProductIds={items.map(item => item.productId)}
                    onClose={() => setShowAddModal(false)}
                    onAdded={handleMutated}
                />
            )}

            {editingItem && familyId && purchaseId && (
                <EditItemModal
                    familyId={familyId}
                    purchaseId={purchaseId}
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onUpdated={handleMutated}
                />
            )}

        </div>
    )
}

export default PurchaseItens