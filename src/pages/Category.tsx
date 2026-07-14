import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../service/api";
import type { PageResponse } from "../types/pagination/PageResponse";

import "../styles/category.css"


import { getErrorMessage } from "../components/utils/GetErrorMessage";
import { useToast } from "../context/ToastContext";
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

import "../styles/category.css";
import "../styles/purchaseModals.css";
import type { CategoryResponse } from "../types/category/CategoryResponse";
import type { CategoryRequest } from "../types/category/CategoryRequest";
import type { CategoryUpdateRequest } from "../types/category/CategoryUpdateRequest";

const PAGE_SIZE = 36;
const DEBOUNCE_MS = 400;

const category_ICONS = [
    FaUtensils, FaHome, FaCar, FaHeartbeat, FaGamepad, FaGraduationCap,
    FaPlane, FaFilm, FaDumbbell, FaGift, FaWallet, FaTshirt, FaEllipsisH,
];

function getIconForCategory(name: string | undefined | null) {
    const safeName = name?.trim() || "outros";
    const hash = safeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return category_ICONS[hash % category_ICONS.length];
}

function Category() {
    const { familyId } = useParams();
    const { showToast } = useToast();

    // ===== listagem/filtro =====
    const [pageData, setPageData] = useState<PageResponse<CategoryResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");



    // ===== dropdown de ações (⋮) por card =====
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const actionMenuRef = useRef<HTMLDivElement | null>(null);

    // ===== modal: criar categoria =====
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCategory, setNewCategory] = useState<CategoryRequest>({ name: "" });
    const [creating, setCreating] = useState(false);

    // ===== modal: editar categoria =====
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
    const [editForm, setEditForm] = useState<CategoryUpdateRequest>({ name: "" });
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
        loadCategories(page);
    }, [familyId, page, debouncedSearch]);

    async function loadCategories(pageNumber: number) {
        if (!familyId) return;

        setLoading(true);

        try {
            const res = await api.get<PageResponse<CategoryResponse>>(
                debouncedSearch.trim()
                    ? `/category/my/family/${familyId}/search`
                    : `/category/my/family/${familyId}`,
                {
                    params: {
                        name: debouncedSearch.trim() || undefined,
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

    const categories = pageData?.content ?? [];


    function toggleActionMenu(categoryId: number) {
        setOpenActionId(prev => (prev === categoryId ? null : categoryId));
    }



    // ===== criar categoria=====
    function openCreateModal() {
        setNewCategory({ name: "" });
        setIsCreateOpen(true);
    }

    function closeCreateModal() {
        setIsCreateOpen(false);
    }

    async function handleCreateCategory(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!familyId) return;

        setCreating(true);

        try {
            await api.post(
                `/category/new/family/${familyId}`,
                newCategory
            );

            showToast("success", "Categoria criada com sucesso!");
            closeCreateModal();
            loadCategories(page);

        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    }

    // ===== editar categoria =====
    function startEdit(category: CategoryResponse) {
        setEditingCategory(category);
        setEditForm({
            name: category.name
        });

        setOpenActionId(null);
    }

    function closeEditModal() {
        setEditingCategory(null);
    }

    async function handleUpdateCategory(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!familyId || !editingCategory) return;

        setSavingEdit(true);

        try {
            await api.put(
                `/category/update/family/${familyId}/category/${editingCategory.id}`,
                editForm
            );

            showToast("success", "Categoria atualizada!");

            closeEditModal();
            loadCategories(page);

        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setSavingEdit(false);
        }
    }

    // ===== excluir categoria =====
    async function handleDeleteCategory(categoryId: number) {
        if (!familyId) return;

        if (!window.confirm("Excluir esta categoria?"))
            return;

        setOpenActionId(null);
        setDeletingId(categoryId);

        try {
            await api.delete(
                `/category/delete/family/${familyId}/category/${categoryId}`
            );

            showToast("success", "Categoria excluída.");

            loadCategories(page);

        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="category-lay">

            {/* ===== modal: criar categoria ===== */}
            {isCreateOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Nova categoria</h2>
                            <button className="modal-close-btn" onClick={closeCreateModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleCreateCategory}>
                                    <input
                                        type="text"
                                        value={newCategory.name}
                                        onChange={(e) =>
                                            setNewCategory({ ...newCategory, name: e.target.value })
                                        }
                                        placeholder="Nome da categoria"
                                        required
                                    />

                                    

                                    <button className="modal-confirm-btn" type="submit" disabled={creating}>
                                        {creating ? "Criando..." : "Criar categoria"}
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

            {/* ===== modal: editar categoria ===== */}
            {editingCategory && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Editar categoria</h2>
                            <button className="modal-close-btn" onClick={closeEditModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleUpdateCategory}>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, name: e.target.value })
                                        }
                                        placeholder="Nome da categoria"
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

            <div className="categories-header">
                <div className="category-title-box">
                    <h1>Categorias</h1>
                    <p>Suas categorias reutilizáveis nos suas produtos.</p>
                </div>

                <div className="category-header-actions">
                    <div className="category-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Pesquisar categorias..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                        />
                    </div>

                    <button className="new-category-btn" onClick={openCreateModal}>
                        <FaPlus /> Nova categoria
                    </button>
                </div>
            </div>

            <div className="category-toolbar">
                <div className="categories-tabs">
                    
                </div>
            </div>

            {loading && !pageData ? (
                <div className="category-empty">
                    <p>Carregando categorias...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="category-empty">
                    <FaBoxOpen className="empty-icon" />
                    <p>Nenhuma categoria encontrada.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {categories.map(category => {
                        const Icon = getIconForCategory(category.name);
                        const isMenuOpen = openActionId === category .id;
                        const isDeleting = deletingId === category.id;

                        return (
                            <div
                                className={`product-card ${isDeleting ? "category-card-deleting" : ""}`}
                                key={category .id}
                            >

                                <div className="category-card-top">
                                    <div className="category-icon-box">
                                        <Icon />
                                    </div>

                                    <div className="category-action-wrapper">
                                        <button
                                            className="category-dots-btn"
                                            onClick={() => toggleActionMenu(category.id)}
                                        >
                                            <HiDotsVertical />
                                        </button>

                                        {isMenuOpen && (
                                            <div className="category-action-menu" ref={actionMenuRef}>
                                                <button
                                                    className="action-menu-item"
                                                    onClick={() => startEdit(category)}
                                                >
                                                    <FaPen /> Editar
                                                </button>
                                                <button
                                                    className="action-menu-item action-menu-danger"
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                >
                                                    <FaTrash /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="category-card-name">{category.name}</p>
                                

                            </div>
                        );
                    })}
                </div>
            )}

            {pageData && pageData.totalPages > 1 && (
                <div className="category-pagination">
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

export default Category