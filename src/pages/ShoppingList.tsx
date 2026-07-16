import { FaBoxOpen, FaChevronLeft, FaChevronRight, FaPlus, FaSearch, FaTimes, FaTrash, FaArrowRight, FaListUl } from "react-icons/fa"
import api from "../service/api"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import type { PageResponse } from "../types/pagination/PageResponse";
import type { ShoppingListResponse } from "../types/ShoppingList/ShoppingListResponse";
import type { ShoppingListRequest } from "../types/ShoppingList/ShoppingListRequest";
import type { ShoppingListUpdateRequest } from "../types/ShoppingList/ShoppingListUpdateRequest";
import { getErrorMessage } from "../components/utils/GetErrorMessage";

import "../styles/shopping-list.css"

import {
    FaPen,
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
import { HiDotsVertical } from "react-icons/hi";

const LIST_ICONS = [
    FaUtensils, FaHome, FaCar, FaHeartbeat, FaGamepad, FaGraduationCap,
    FaPlane, FaFilm, FaDumbbell, FaGift, FaWallet, FaTshirt, FaEllipsisH,
];

function getIconForList(name: string | undefined | null) {
    const safeName = name?.trim() || "outros";
    const hash = safeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return LIST_ICONS[hash % LIST_ICONS.length];
}

function formatDate(dateTime: string) {
    return new Date(dateTime).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 400;

function ShoppingList() {

    const { familyId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [pageData, setPageData] = useState<PageResponse<ShoppingListResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const actionMenuRef = useRef<HTMLDivElement | null>(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newList, setNewList] = useState<ShoppingListRequest>({ name: "" });
    const [creating, setCreating] = useState(false);

    const [editingList, setEditingList] = useState<ShoppingListResponse | null>(null);
    const [editForm, setEditForm] = useState<ShoppingListUpdateRequest>({ name: "" });
    const [savingEdit, setSavingEdit] = useState(false);

    const [deletingId, setDeletingId] = useState<number | null>(null);

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

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(0);
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        loadLists(page);
    }, [familyId, page, debouncedSearch]);

    async function loadLists(pageNumber: number) {
        if (!familyId) return;
        setLoading(true);

        try {
            const res = await api.get<PageResponse<ShoppingListResponse>>(
                debouncedSearch.trim()
                    ? `/shopping-list/my/family/${familyId}/search`
                    : `/shopping-list/my/family/${familyId}`,
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

    const lists = pageData?.content ?? [];

    function toggleActionMenu(listId: number) {
        setOpenActionId(prev => (prev === listId ? null : listId));
    }

    function openCreateModal() {
        setNewList({ name: "" });
        setIsCreateOpen(true);
    }

    function closeCreateModal() {
        setIsCreateOpen(false);
    }

    async function handleCreateList(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId) return;
        setCreating(true);

        try {
            await api.post(`/shopping-list/new/family/${familyId}`, newList);
            showToast("success", "Lista de compras criada com sucesso!");
            closeCreateModal();
            loadLists(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    }

    function startEdit(list: ShoppingListResponse) {
        setEditingList(list);
        setEditForm({ name: list.name });
        setOpenActionId(null);
    }

    function closeEditModal() {
        setEditingList(null);
    }

    async function handleUpdateList(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId || !editingList) return;
        setSavingEdit(true);

        try {
            await api.put(
                `/shopping-list/update/family/${familyId}/list/${editingList.id}`,
                editForm
            );
            showToast("success", "Lista de compras atualizada!");
            closeEditModal();
            loadLists(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setSavingEdit(false);
        }
    }

    async function handleDeleteList(listId: number) {
        if (!familyId) return;
        if (!window.confirm("Excluir esta lista de compras?")) return;

        setOpenActionId(null);
        setDeletingId(listId);

        try {
            await api.delete(`/shopping-list/delete/family/${familyId}/list/${listId}`);
            showToast("success", "Lista de compras excluída.");
            loadLists(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="shopping-list-lay">

            {isCreateOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Nova lista de compras</h2>
                            <button className="modal-close-btn" onClick={closeCreateModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleCreateList}>
                                    <input
                                        type="text"
                                        value={newList.name}
                                        onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                                        placeholder="Nome da lista de compras"
                                        required
                                    />
                                    <button className="modal-confirm-btn" type="submit" disabled={creating}>
                                        {creating ? "Criando..." : "Criar lista de compras"}
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

            {editingList && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Editar lista de compras</h2>
                            <button className="modal-close-btn" onClick={closeEditModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleUpdateList}>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Nome da lista de compras"
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

            <div className="shopping-list-header">
                <div className="shopping-list-title-box">
                    <h1>Lista de compras</h1>
                    <p>Organize e acompanhe os itens que precisam ser comprados.</p>
                </div>

                <div className="shopping-list-header-actions">
                    <div className="shopping-list-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Pesquisar lista de compras..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                        />
                    </div>

                    <button className="new-list-btn" onClick={openCreateModal}>
                        <FaPlus /> Nova lista de compra
                    </button>
                </div>
            </div>

            {loading && !pageData ? (
                <div className="shopping-list-empty">
                    <p>Carregando listas...</p>
                </div>
            ) : lists.length === 0 ? (
                <div className="shopping-list-empty">
                    <FaBoxOpen className="empty-icon" />
                    <p>Nenhuma lista de compras encontrada.</p>
                </div>
            ) : (
                <div className="shopping-list-grid">
                    {lists.map(l => {
                        const Icon = getIconForList(l.name);
                        const isMenuOpen = openActionId === l.id;
                        const isDeleting = deletingId === l.id;

                        return (
                            <div
                                className={`list-card ${isDeleting ? "list-card-deleting" : ""}`}
                                key={l.id}
                            >

                                <div className="list-card-top">
                                    <div className="list-icon-box">
                                        <Icon />
                                    </div>

                                    <div className="list-action-wrapper">
                                        <button
                                            className="list-dots-btn"
                                            onClick={() => toggleActionMenu(l.id)}
                                        >
                                            <HiDotsVertical />
                                        </button>

                                        {isMenuOpen && (
                                            <div className="list-action-menu" ref={actionMenuRef}>
                                                <button className="action-menu-item" onClick={() => startEdit(l)}>
                                                    <FaPen /> Editar
                                                </button>
                                                <button
                                                    className="action-menu-item action-menu-danger"
                                                    onClick={() => handleDeleteList(l.id)}
                                                >
                                                    <FaTrash /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="list-card-name">{l.name}</p>

                                <div className="list-card-meta">
                                    <span className="list-card-items">
                                        <FaListUl /> {l.totalItems} {l.totalItems === 1 ? "item" : "itens"}
                                    </span>
                                    <span className="list-card-date">{formatDate(l.createdAt)}</span>
                                </div>

                                <button
                                    className="list-details-btn"
                                    onClick={() => navigate(`/family/${familyId}/shopping-list/${l.id}`, {
                                        state: { name: l.name }
                                    })}
                                >
                                    Ver detalhes <FaArrowRight />
                                </button>

                            </div>
                        );
                    })}
                </div>
            )}

            {pageData && pageData.totalPages > 1 && (
                <div className="shopping-list-pagination">
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

export default ShoppingList