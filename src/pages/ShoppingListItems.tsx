import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../service/api";
import type { PageResponse } from "../types/pagination/PageResponse";
import type { ListItemResponse } from "../types/ShoppingList/ListItemResponse";
import type { ListItemRequest } from "../types/ShoppingList/ListItemRequest";
import type { ListItemUpdateRequest } from "../types/ShoppingList/ListItemUpdateRequest";
import type { ListItemDeleteRequest } from "../types/ShoppingList/ListItemDeleteRequest";
import type { PriorityList } from "../types/ShoppingList/PriorityList";
import { getErrorMessage } from "../components/utils/GetErrorMessage";
import { useToast } from "../context/ToastContext";

import {
    FaArrowLeft,
    FaPlus,
    FaTimes,
    FaPen,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
    FaBoxOpen
} from "react-icons/fa";

import "../styles/shopping-list.css";
import "../styles/purchaseModals.css";
import "../styles/shoppingListItems.css";

const PAGE_SIZE = 12;

const PRIORITY_LABELS: Record<PriorityList, string> = {
    NORMAL: "Normal",
    URGENTE: "Alta"
};

function ShoppingListItems() {
    const { familyId, shoppingListId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const listName = (location.state as { name?: string } | null)?.name;

    const [pageData, setPageData] = useState<PageResponse<ListItemResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState<ListItemRequest>({ name: "", done: false, priority: "NORMAL" });
    const [creating, setCreating] = useState(false);

    const [editingItem, setEditingItem] = useState<ListItemResponse | null>(null);
    const [editForm, setEditForm] = useState<ListItemUpdateRequest>({ name: "", priority: "NORMAL" });
    const [savingEdit, setSavingEdit] = useState(false);

    async function loadItems(pageNumber: number) {
        if (!familyId || !shoppingListId) return;

        setLoading(true);

        try {
            const res = await api.get<PageResponse<ListItemResponse>>(
                `/shopping-list/my/family/${familyId}/list/${shoppingListId}`,
                { params: { page: pageNumber, size: PAGE_SIZE } }
            );

            setPageData(res.data);
            setSelectedIds(new Set());
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadItems(page);
    }, [familyId, shoppingListId, page]);

    const items = pageData?.content ?? [];

    function toggleSelect(itemId: number) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
    }

    // ===== toggle done =====
    async function handleToggleDone(item: ListItemResponse) {
        if (!familyId || !shoppingListId) return;

        setTogglingId(item.id);

        try {
            await api.put(
                `/shopping-list/update/family/${familyId}/list/${shoppingListId}/item/${item.id}/done`,
                { done: !item.done }
            );
            loadItems(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setTogglingId(null);
        }
    }

    // ===== criar item =====
    function openCreateModal() {
        setNewItem({ name: "", done: false, priority: "NORMAL" });
        setIsCreateOpen(true);
    }

    function closeCreateModal() {
        setIsCreateOpen(false);
    }

    async function handleCreateItem(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId || !shoppingListId) return;

        setCreating(true);

        try {
            await api.post(
                `/shopping-list/new/family/${familyId}/list/${shoppingListId}/add`,
                newItem
            );
            showToast("success", "Item adicionado!");
            closeCreateModal();
            loadItems(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    }

    // ===== editar item =====
    function startEdit(item: ListItemResponse) {
        setEditingItem(item);
        setEditForm({ name: item.name, priority: item.priority });
    }

    function closeEditModal() {
        setEditingItem(null);
    }

    async function handleUpdateItem(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId || !shoppingListId || !editingItem) return;

        setSavingEdit(true);

        try {
            await api.put(
                `/shopping-list/update/family/${familyId}/list/${shoppingListId}/item/${editingItem.id}`,
                editForm
            );
            showToast("success", "Item atualizado!");
            closeEditModal();
            loadItems(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setSavingEdit(false);
        }
    }

    // ===== excluir =====
    async function handleDeleteOne(itemId: number) {
        if (!familyId || !shoppingListId) return;
        if (!window.confirm("Remover esse item da lista?")) return;

        try {
            await api.delete(
                `/shopping-list/delete/family/${familyId}/list/${shoppingListId}/item/${itemId}`
            );
            showToast("success", "Item removido.");
            loadItems(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        }
    }

    async function handleDeleteSelected() {
        if (!familyId || !shoppingListId || selectedIds.size === 0) return;
        if (!window.confirm(`Remover ${selectedIds.size} item(ns) da lista?`)) return;

        setDeleting(true);

        try {
            const payload: ListItemDeleteRequest = { ids: Array.from(selectedIds) };

            await api.delete(
                `/shopping-list/delete/family/${familyId}/list/${shoppingListId}/item/many`,
                { data: payload }
            );

            showToast("success", "Itens removidos.");
            loadItems(page);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="shopping-list-items-lay">

            <button className="back-btn" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Voltar
            </button>

            {/* ===== modal: criar item ===== */}
            {isCreateOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Novo item</h2>
                            <button className="modal-close-btn" onClick={closeCreateModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleCreateItem}>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        placeholder="Nome do item"
                                        minLength={3}
                                        maxLength={25}
                                        required
                                    />

                                    <select
                                        className="priority-select"
                                        value={newItem.priority}
                                        onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as PriorityList })}
                                    >
                                        
                                        <option value="NORMAL">Normal</option>
                                        <option value="URGENTE">Alta</option>
                                    </select>

                                    <button className="modal-confirm-btn" type="submit" disabled={creating}>
                                        {creating ? "Adicionando..." : "Adicionar item"}
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

            {/* ===== modal: editar item ===== */}
            {editingItem && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Editar item</h2>
                            <button className="modal-close-btn" onClick={closeEditModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleUpdateItem}>
                                    <input
                                        type="text"
                                        value={editForm.name ?? ""}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Nome do item"
                                        minLength={3}
                                        maxLength={25}
                                        required
                                    />

                                    <select
                                        className="priority-select"
                                        value={editForm.priority ?? "NORMAL"}
                                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as PriorityList })}
                                    >
                                        
                                        <option value="NORMAL">Normal</option>
                                        <option value="URGENTE">Alta</option>
                                    </select>

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

            <div className="shopping-list-items-header">
                <div>
                    <h2>{listName ?? "Itens da lista"}</h2>
                    {pageData && (
                        <span className="items-count">
                            {pageData.totalElements} {pageData.totalElements === 1 ? "item" : "itens"}
                        </span>
                    )}
                </div>

                <button className="new-list-btn" onClick={openCreateModal}>
                    <FaPlus /> Adicionar item
                </button>
            </div>

            {selectedIds.size > 0 && (
                <div className="bulk-action-bar">
                    <span>{selectedIds.size} selecionado(s)</span>
                    <button onClick={handleDeleteSelected} disabled={deleting}>
                        <FaTrash /> {deleting ? "Removendo..." : "Excluir selecionados"}
                    </button>
                </div>
            )}

            {loading && !pageData ? (
                <div className="shopping-list-empty">
                    <p>Carregando itens...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="shopping-list-empty">
                    <FaBoxOpen className="empty-icon" />
                    <p>Nenhum item nessa lista ainda.</p>
                </div>
            ) : (
                <div className="list-items-list">
                    {items.map(item => {
                        const isSelected = selectedIds.has(item.id);
                        const isToggling = togglingId === item.id;

                        return (
                            <div className={`list-item-row ${item.done ? "list-item-done" : ""}`} key={item.id}>

                                <input
                                    type="checkbox"
                                    className="item-checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(item.id)}
                                />

                                <button
                                    className={`done-toggle ${item.done ? "done-toggle-checked" : ""}`}
                                    onClick={() => handleToggleDone(item)}
                                    disabled={isToggling}
                                    title={item.done ? "Marcar como pendente" : "Marcar como concluído"}
                                >
                                    {item.done && "✓"}
                                </button>

                                <span className="item-list-name">{item.name}</span>

                                <span className={`priority-badge priority-${item.priority.toLowerCase()}`}>
                                    {PRIORITY_LABELS[item.priority]}
                                </span>

                                <div className="item-actions">
                                    <button className="item-action-btn" onClick={() => startEdit(item)}>
                                        <FaPen />
                                    </button>
                                    <button
                                        className="item-action-btn item-action-danger"
                                        onClick={() => handleDeleteOne(item.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>

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

export default ShoppingListItems