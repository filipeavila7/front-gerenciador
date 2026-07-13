import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../service/api";
import type { PageResponse } from "../types/pagination/PageResponse";
import type { ProductResponse } from "../types/product/ProductResponse";
import type { ProductRequest } from "../types/product/ProductRequest";
import type { ProductUpdateRequest } from "../types/product/ProductUpdateRequest";
import { getErrorMessage } from "../components/utils/GetErrorMessage";
import { useToast } from "../context/ToastContext";
import CategorySelectField from "../components/product/CategorySelectField";
import CategoryFilterDropdown from "../components/product/CategoryFilterDropdown";
import { HiDotsVertical } from "react-icons/hi";

import {
    FaPlus,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
    FaPen,
    FaTrash,
    FaBoxOpen,
    FaUtensils,
    FaHome,
    FaCar,
    FaHeartbeat,
    FaGamepad,
    FaGraduationCap,
    FaPlane,
    FaFilm,
    FaDumbbell,
    FaGift,
    FaWallet,
    FaTshirt,
    FaEllipsisH
} from "react-icons/fa";

import "../styles/product.css";
import "../styles/purchaseModals.css";

const PAGE_SIZE = 36;
const DEBOUNCE_MS = 400;

const PRODUCT_ICONS = [
    FaUtensils, FaHome, FaCar, FaHeartbeat, FaGamepad, FaGraduationCap,
    FaPlane, FaFilm, FaDumbbell, FaGift, FaWallet, FaTshirt, FaEllipsisH,
];

function getIconForCategory(name: string | undefined | null) {
    const safeName = name?.trim() || "outros";
    const hash = safeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PRODUCT_ICONS[hash % PRODUCT_ICONS.length];
}

function Products() {
    const { familyId } = useParams();
    const { showToast } = useToast();

    // ===== listagem/filtro =====
    const [pageData, setPageData] = useState<PageResponse<ProductResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
    const [filterCategoryName, setFilterCategoryName] = useState<string | null>(null);

    // ===== dropdown de ações (⋮) por card =====
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const actionMenuRef = useRef<HTMLDivElement | null>(null);

    // ===== modal: criar produto =====
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newProduct, setNewProduct] = useState<ProductRequest>({ name: "", categoryId: 0 });
    const [newCategoryName, setNewCategoryName] = useState<string | undefined>(undefined);
    const [creating, setCreating] = useState(false);

    // ===== modal: editar produto =====
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [editForm, setEditForm] = useState<ProductUpdateRequest>({ name: "", categoryId: 0 });
    const [editCategoryName, setEditCategoryName] = useState<string | undefined>(undefined);
    const [savingEdit, setSavingEdit] = useState(false);

    // ===== exclusão =====
    const [deletingId, setDeletingId] = useState<number | null>(null);

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

    // debounce da busca por nome — só atualiza o termo "de verdade" após o usuário parar de digitar
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(0); // toda vez que o filtro muda, volta pra primeira página
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // recarrega sempre que a página, o termo de busca (debounced) ou a categoria mudarem
    useEffect(() => {
        loadProducts(page);
    }, [familyId, page, debouncedSearch, filterCategoryId]);

    async function loadProducts(pageNumber: number) {
        if (!familyId) return;

        setLoading(true);

        const hasFilter = debouncedSearch.trim().length > 0 || filterCategoryId !== null;

        try {
            const res = await api.get<PageResponse<ProductResponse>>(
                hasFilter
                    ? `/products/my/family/${familyId}/search`
                    : `/products/my/family/${familyId}`,
                {
                    params: hasFilter
                        ? {
                              name: debouncedSearch.trim() || undefined,
                              categoryId: filterCategoryId ?? undefined,
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
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    const products = pageData?.content ?? [];

    function toggleActionMenu(productId: number) {
        setOpenActionId(prev => (prev === productId ? null : productId));
    }

    function handleCategoryFilterSelect(categoryId: number | null, categoryName: string | null) {
        setFilterCategoryId(categoryId);
        setFilterCategoryName(categoryName);
        setPage(0);
    }

    // ===== criar produto =====
    function openCreateModal() {
        setNewProduct({ name: "", categoryId: 0 });
        setNewCategoryName(undefined);
        setIsCreateOpen(true);
    }

    function closeCreateModal() {
        setIsCreateOpen(false);
    }

    async function handleCreateProduct(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId) return;

        if (!newProduct.categoryId) {
            showToast("error", "Selecione uma categoria para o produto.");
            return;
        }

        setCreating(true);

        try {
            await api.post(`/products/new/family/${familyId}`, newProduct);
            showToast("success", "Produto criado com sucesso!");
            closeCreateModal();
            loadProducts(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    }

    // ===== editar produto =====
    function startEdit(product: ProductResponse) {
        setEditingProduct(product);
        setEditForm({ name: product.name, categoryId: product.categoryId });
        setEditCategoryName(product.categoryName);
        setOpenActionId(null);
    }

    function closeEditModal() {
        setEditingProduct(null);
    }

    async function handleUpdateProduct(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId || !editingProduct) return;

        if (!editForm.categoryId) {
            showToast("error", "Selecione uma categoria para o produto.");
            return;
        }

        setSavingEdit(true);

        try {
            await api.put(
                `/products/update/family/${familyId}/product/${editingProduct.id}`,
                editForm
            );

            showToast("success", "Produto atualizado!");
            closeEditModal();
            loadProducts(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setSavingEdit(false);
        }
    }

    // ===== excluir produto =====
    async function handleDeleteProduct(productId: number) {
        if (!familyId) return;
        if (!window.confirm("Excluir esse produto? Ele deixará de estar disponível para novas compras.")) return;

        setOpenActionId(null);
        setDeletingId(productId);

        try {
            await api.delete(`/products/delete/family/${familyId}/product/${productId}`);
            showToast("success", "Produto excluído.");
            loadProducts(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="product-lay">

            {/* ===== modal: criar produto ===== */}
            {isCreateOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Novo produto</h2>
                            <button className="modal-close-btn" onClick={closeCreateModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleCreateProduct}>
                                    <input
                                        type="text"
                                        value={newProduct.name}
                                        onChange={(e) =>
                                            setNewProduct({ ...newProduct, name: e.target.value })
                                        }
                                        placeholder="Nome do produto"
                                        required
                                    />

                                    {familyId && (
                                        <CategorySelectField
                                            familyId={familyId}
                                            value={newProduct.categoryId || null}
                                            valueName={newCategoryName}
                                            onChange={(categoryId, categoryName) => {
                                                setNewProduct({ ...newProduct, categoryId });
                                                setNewCategoryName(categoryName);
                                            }}
                                        />
                                    )}

                                    <button className="modal-confirm-btn" type="submit" disabled={creating}>
                                        {creating ? "Criando..." : "Criar produto"}
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

            {/* ===== modal: editar produto ===== */}
            {editingProduct && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Editar produto</h2>
                            <button className="modal-close-btn" onClick={closeEditModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleUpdateProduct}>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, name: e.target.value })
                                        }
                                        placeholder="Nome do produto"
                                        required
                                    />

                                    {familyId && (
                                        <CategorySelectField
                                            familyId={familyId}
                                            value={editForm.categoryId || null}
                                            valueName={editCategoryName}
                                            onChange={(categoryId, categoryName) => {
                                                setEditForm({ ...editForm, categoryId });
                                                setEditCategoryName(categoryName);
                                            }}
                                        />
                                    )}

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

            <div className="product-header">
                <div className="product-title-box">
                    <h1>Produtos</h1>
                    <p>Seus produtos reutilizáveis nas suas compras.</p>
                </div>

                <div className="product-header-actions">
                    <div className="product-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Pesquisar produtos..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                        />
                    </div>

                    <button className="new-product-btn" onClick={openCreateModal}>
                        <FaPlus /> Novo produto
                    </button>
                </div>
            </div>

            <div className="product-toolbar">
                <div className="product-tabs">
                    {familyId && (
                        <CategoryFilterDropdown
                            familyId={familyId}
                            selectedCategoryId={filterCategoryId}
                            selectedCategoryName={filterCategoryName}
                            onSelect={handleCategoryFilterSelect}
                        />
                    )}
                </div>
            </div>

            {loading && !pageData ? (
                <div className="product-empty">
                    <p>Carregando produtos...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="product-empty">
                    <FaBoxOpen className="empty-icon" />
                    <p>Nenhum produto encontrado.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map(product => {
                        const Icon = getIconForCategory(product.categoryName);
                        const isMenuOpen = openActionId === product.id;
                        const isDeleting = deletingId === product.id;

                        return (
                            <div
                                className={`product-card ${isDeleting ? "product-card-deleting" : ""}`}
                                key={product.id}
                            >

                                <div className="product-card-top">
                                    <div className="product-icon-box">
                                        <Icon />
                                    </div>

                                    <div className="product-action-wrapper">
                                        <button
                                            className="product-dots-btn"
                                            onClick={() => toggleActionMenu(product.id)}
                                        >
                                            <HiDotsVertical />
                                        </button>

                                        {isMenuOpen && (
                                            <div className="product-action-menu" ref={actionMenuRef}>
                                                <button
                                                    className="action-menu-item"
                                                    onClick={() => startEdit(product)}
                                                >
                                                    <FaPen /> Editar
                                                </button>
                                                <button
                                                    className="action-menu-item action-menu-danger"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                >
                                                    <FaTrash /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="product-card-name">{product.name}</p>
                                <span className="product-card-category">{product.categoryName || "Sem categoria"}</span>

                            </div>
                        );
                    })}
                </div>
            )}

            {pageData && pageData.totalPages > 1 && (
                <div className="product-pagination">
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

export default Products