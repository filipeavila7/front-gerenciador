import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../service/api";
import type { FamilyResponse } from "../types/family/FamilyResponse";
import type { MemberResponse } from "../types/family/MemberResponse";
import type { FamilyUpdateRequest } from "../types/family/FamilyUpdateRequest";
import { getErrorMessage } from "../components/utils/GetErrorMessage";
import { useToast } from "../context/ToastContext";
import { HiDotsVertical } from "react-icons/hi";

import {
    FaPen,
    FaCrown,
    FaUserMinus,
    FaSignOutAlt,
    FaTimes,
    FaCamera,
    FaUser,
    FaPlus
} from "react-icons/fa";

import "../styles/page.css";
import "../styles/family.css";
import "../styles/purchaseModals.css";

function formatDate(dateTime: string) {
    return new Date(dateTime).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric"
    });
}

function Family() {
    const { familyId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [family, setFamily] = useState<FamilyResponse | null>(null);
    const [loadingFamily, setLoadingFamily] = useState(false);

    // ===== membros (lista simples, não paginada) =====
    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [membersLoaded, setMembersLoaded] = useState(false);

    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const actionMenuRef = useRef<HTMLDivElement | null>(null);

    // ===== modal: editar família =====
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [savingFamily, setSavingFamily] = useState(false);


    const [shareModal, setShareModal] = useState(false);

    // ===== ações de membro =====
    const [promotingId, setPromotingId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    // ===== sair da família =====
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [exiting, setExiting] = useState(false);

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

    async function loadFamily() {
        if (!familyId) return;
        setLoadingFamily(true);

        try {
            // ASSUMIDO — endpoint não confirmado, ajustar se o real for outro
            const res = await api.get<FamilyResponse>(`/families/my/family/${familyId}`);
            setFamily(res.data);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setLoadingFamily(false);
        }
    }

    async function loadMembers() {
        if (!familyId) return;
        setLoadingMembers(true);

        try {
            const res = await api.get<MemberResponse[]>(
                `/families/my/family/${familyId}/members`
            );
            setMembers(res.data);
            setMembersLoaded(true);
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setLoadingMembers(false);
        }
    }

    useEffect(() => {
        loadFamily();
        loadMembers();
    }, [familyId]);

    function toggleActionMenu(memberId: number) {
        setOpenActionId(prev => (prev === memberId ? null : memberId));
    }

    // ===== editar família =====
    function openEditModal() {
        if (!family) return;
        setEditName(family.name);
        setImageFile(null);
        setImagePreview(family.profileImg || null);
        setIsEditOpen(true);
    }

    function closeEditModal() {
        setIsEditOpen(false);
        setImageFile(null);
        setImagePreview(null);
    }


    function openShareModal() {
        if (!family) return;
        setShareModal(true);
    }


    function closeShareModal() {
        setShareModal(false);

    }

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function handleSaveFamily(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!familyId || !family) return;

        setSavingFamily(true);

        try {
            const payload: FamilyUpdateRequest = { name: editName };

            // só inclui profileImg no payload se o usuário selecionou uma imagem nova
            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);

                const uploadRes = await api.post<string>("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                payload.profileImg = uploadRes.data;
            }

            await api.put(`/families/update/family/${familyId}`, payload);

            showToast("success", "Família atualizada com sucesso!");
            closeEditModal();
            loadFamily();
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setSavingFamily(false);
        }
    }

    // ===== promover a admin =====
    async function handlePromoteToAdmin(memberId: number) {
        if (!familyId) return;
        if (!window.confirm("Tornar este membro um administrador da família?")) return;

        setOpenActionId(null);
        setPromotingId(memberId);

        try {
            await api.put(`/families/update/family/${familyId}/member/${memberId}`);
            showToast("success", "Membro promovido a administrador!");
            loadMembers();
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setPromotingId(null);
        }
    }

    // ===== remover membro =====
    async function handleRemoveMember(memberId: number, memberName: string) {
        if (!familyId) return;
        if (!window.confirm(`Remover ${memberName} da família?`)) return;

        setOpenActionId(null);
        setRemovingId(memberId);

        try {
            await api.delete(`/families/remove/family/${familyId}/member/${memberId}`);
            showToast("success", "Membro removido da família.");
            loadFamily();
            loadMembers();
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setRemovingId(null);
        }
    }


    async function handleShare() {
        try {
            const response = await api.post<{ token: string }>(
                `/invite/family/${familyId}/new`
            );

            const inviteUrl = `${import.meta.env.VITE_FRONTEND_URL}/invite/${response.data.token}`;


            if (navigator.share) {
                await navigator.share({
                    title: "Convite para família",
                    text: "Você recebeu um convite para entrar na minha família!",
                    url: inviteUrl,
                });

            } else {
                await navigator.clipboard.writeText(inviteUrl);
                showToast("success", "Link copiado!");
            }

        } catch (err) {
            showToast("error", getErrorMessage(err));
        }
    }

    // ===== sair da família =====
    // regra da API: não é possível sair se for o único membro
    const canExit = family ? family.totalMembers > 1 : false;

    async function handleExitFamily() {
        if (!familyId) return;

        setExiting(true);

        try {
            await api.delete(`/families/exit/family/${familyId}`);
            showToast("success", "Você saiu da família.");
            setIsExitModalOpen(false);
            navigate("/family-selection"); // ajustar para a rota real de seleção de família
        } catch (err) {
            showToast("error", getErrorMessage(err));
        } finally {
            setExiting(false);
        }
    }

    if (loadingFamily && !family) {
        return (
            <div className="page-lay">
                <p className="family-empty">Carregando família...</p>
            </div>
        )
    }

    if (!family) {
        return (
            <div className="page-lay">
                <p className="family-empty">Família não encontrada.</p>
            </div>
        )
    }

    return (
        <div className="page-lay">

            {/* ===== modal: editar família ===== */}
            {isEditOpen && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar família</h2>
                            <button className="modal-close-btn" onClick={closeEditModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-purchase-modal">
                            <div className="purchase-form-box">
                                <form className="purchase-form" onSubmit={handleSaveFamily}>

                                    <label className="image-upload-box">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="image-upload-preview" />
                                        ) : (
                                            <div className="image-upload-placeholder">
                                                <FaUser />
                                            </div>
                                        )}

                                        <div className="image-upload-overlay">
                                            <FaCamera />
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            hidden
                                        />
                                    </label>

                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Nome da família"
                                        required
                                    />

                                    <button className="modal-confirm-btn" type="submit" disabled={savingFamily}>
                                        {savingFamily ? "Salvando..." : "Salvar alterações"}
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

            {/* ===== modal: confirmar saída ===== */}
            {isExitModalOpen && (
                <div className="modal-overlay" onClick={() => setIsExitModalOpen(false)}>
                    <div className="modal-box modal-box-small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Sair da família</h2>
                            <button className="modal-close-btn" onClick={() => setIsExitModalOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <p className="exit-warning-text">
                            Tem certeza que deseja sair de <strong>{family.name}</strong>? Você perderá
                            acesso a todos os dados dessa família e precisará ser convidado novamente
                            para voltar.
                        </p>

                        <div className="modal-footer">
                            <button
                                className="modal-cancel-btn"
                                onClick={() => setIsExitModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="modal-confirm-btn modal-confirm-btn-danger"
                                onClick={handleExitFamily}
                                disabled={exiting}
                            >
                                {exiting ? "Saindo..." : "Sair da família"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {shareModal && (
                <div className="modal-overlay" onClick={closeShareModal}>
                    <div className="modal-box modal-box-small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Convidar novo membro</h2>
                            <button className="modal-close-btn" onClick={closeShareModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <p className="exit-warning-text">
                            Cada convite é unico e contem uma duração de 1 semana
                        </p>

                        <div className="modal-footer">
                            <button
                                className="share-btn"
                                onClick={handleShare}
                            >
                                Gerar link de convite
                            </button>

                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div className="page-title-box">
                    <h1>Minha família</h1>
                    <p>Gerencie os dados e membros da sua família.</p>
                </div>
                <button onClick={openShareModal} className="new-product-btn" >
                    <FaPlus /> Convidar
                </button>
            </div>

            {/* ===== card principal da família ===== */}
            <div className="family-hero-card">

                <div className="family-hero-avatar">
                    {family.profileImg ? (
                        <img src={family.profileImg} alt={family.name} />
                    ) : (
                        <FaUser className="family-hero-avatar-fallback" />
                    )}
                </div>

                <div className="family-hero-info">
                    <h2>{family.name}</h2>
                    <div className="family-hero-meta">
                        <span>{family.totalMembers} {family.totalMembers === 1 ? "membro" : "membros"}</span>
                        <span className="family-hero-dot">•</span>
                        <span>Criada em {formatDate(family.createdAt)}</span>
                    </div>
                </div>

                <button className="family-edit-btn" onClick={openEditModal}>
                    <FaPen /> Editar família
                </button>

            </div>

            {/* ===== lista de membros ===== */}
            <div className="family-members-section">
                <h3 className="family-section-title">Membros</h3>

                {loadingMembers && !membersLoaded ? (
                    <p className="family-empty">Carregando membros...</p>
                ) : members.length === 0 ? (
                    <p className="family-empty">Nenhum membro encontrado.</p>
                ) : (
                    <div className="family-members-list">
                        {members.map(member => {
                            const isMenuOpen = openActionId === member.id;
                            const isPromoting = promotingId === member.id;
                            const isRemoving = removingId === member.id;
                            const isAdmin = member.role === "ADMIN";

                            return (
                                <div
                                    className={`family-member-row ${isRemoving ? "family-member-removing" : ""}`}
                                    key={member.id}
                                >

                                    <div className="family-member-avatar">
                                        {member.profileImg ? (
                                            <img src={member.profileImg} alt={member.name} />
                                        ) : (
                                            <FaUser />
                                        )}
                                    </div>

                                    <div className="family-member-info">
                                        <div className="family-member-name-row">
                                            <span className="family-member-name">{member.name}</span>
                                            {isAdmin && (
                                                <span className="family-member-admin-badge">
                                                    <FaCrown /> Admin
                                                </span>
                                            )}
                                        </div>
                                        <span className="family-member-joined">
                                            Entrou em {formatDate(member.joinedAt)}
                                        </span>
                                    </div>

                                    <div className="family-member-action-wrapper">
                                        <button
                                            className="family-member-dots-btn"
                                            onClick={() => toggleActionMenu(member.id)}
                                            disabled={isPromoting || isRemoving}
                                        >
                                            <HiDotsVertical />
                                        </button>

                                        {isMenuOpen && (
                                            <div className="family-member-menu" ref={actionMenuRef}>
                                                {!isAdmin && (
                                                    <button
                                                        className="action-menu-item"
                                                        onClick={() => handlePromoteToAdmin(member.userId)}
                                                    >
                                                        <FaCrown /> Tornar admin
                                                    </button>
                                                )}
                                                <button
                                                    className="action-menu-item action-menu-danger"
                                                    onClick={() => handleRemoveMember(member.userId, member.name)}
                                                >
                                                    <FaUserMinus /> Remover da família
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ===== zona de perigo: sair da família ===== */}
            <div className="family-danger-zone">
                <div className="family-danger-info">
                    <h3>Sair da família</h3>
                    <p>
                        {canExit
                            ? "Você deixará de ter acesso aos dados dessa família."
                            : "Você é o único membro dessa família e não pode sair. Adicione outro membro ou exclua a família."}
                    </p>
                </div>

                <button
                    className="family-exit-btn"
                    onClick={() => setIsExitModalOpen(true)}
                    disabled={!canExit}
                    title={!canExit ? "Você é o único membro da família" : undefined}
                >
                    <FaSignOutAlt /> Sair da família
                </button>
            </div>

        </div>
    )
}

export default Family