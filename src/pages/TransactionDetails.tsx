import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../service/api";
import type { TransactionInfoResponse } from "../types/transaction/TransactionInfoResponse";
import { getErrorMessage } from "../components/utils/GetErrorMessage";
import { useToast } from "../context/ToastContext";

import {
    FaArrowLeft,
    FaArrowUp,
    FaArrowDown,
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
    FaPaw,
    FaEllipsisH
} from "react-icons/fa";

import "../styles/transactions.css";

const CATEGORY_ICONS = [
    FaUtensils, FaHome, FaCar, FaHeartbeat, FaGamepad, FaGraduationCap,
    FaPlane, FaFilm, FaDumbbell, FaGift, FaWallet, FaTshirt, FaPaw, FaEllipsisH,
];

function getIconForCategory(name: string | undefined | null) {
    const safeName = name?.trim() || "outros";
    const hash = safeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CATEGORY_ICONS[hash % CATEGORY_ICONS.length];
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateTime: string) {
    return new Date(dateTime).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function TransactionDetails() {
    const { familyId, transactionId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [transaction, setTransaction] = useState<TransactionInfoResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!familyId || !transactionId) return;

        let ignore = false;

        async function loadDetails() {
            setLoading(true);

            try {
                const res = await api.get<TransactionInfoResponse>(
                    `/transactions/get/transaction/${transactionId}/family/${familyId}`
                );

                if (!ignore) setTransaction(res.data);
            } catch (err) {
                if (!ignore) showToast("error", getErrorMessage(err));
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadDetails();

        return () => { ignore = true; };
    }, [familyId, transactionId]);

    if (loading && !transaction) {
        return (
            <div className="transaction-details-lay">
                <p className="transactions-empty">Carregando detalhes...</p>
            </div>
        )
    }

    if (!transaction) {
        return (
            <div className="transaction-details-lay">
                <p className="transactions-empty">Transação não encontrada.</p>
            </div>
        )
    }

    const isIncome = transaction.type === "INCOME";
    const hasItems = transaction.items && transaction.items.length > 0;

    return (
        <div className="transaction-details-lay">

            <button className="back-btn" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Voltar
            </button>

            <div className="transaction-details-card">

                <div className="transaction-details-top">
                    <div className={`transaction-type-icon transaction-type-icon-lg ${isIncome ? "type-income" : "type-expense"}`}>
                        {isIncome ? <FaArrowUp /> : <FaArrowDown />}
                    </div>

                    <div className="transaction-details-title-box">
                        <h2>{transaction.title}</h2>
                        <span className="transaction-date">{formatDate(transaction.date)}</span>
                    </div>

                    <div className={`transaction-amount transaction-amount-lg ${isIncome ? "type-income" : "type-expense"}`}>
                        {isIncome ? "+" : "-"} {formatCurrency(transaction.ammount)}
                    </div>
                </div>

                {transaction.description && (
                    <p className="transaction-details-description">{transaction.description}</p>
                )}

            </div>

            {hasItems && (
                <div className="transaction-details-card">
                    <h3 className="transaction-items-title">
                        Produtos da compra
                    </h3>

                    <div className="purchase-itens-list">
                        {transaction.items.map(item => {
                            const Icon = getIconForCategory(item.categoryName);

                            return (
                                <div className="purchase-item-row" key={item.productId}>

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

                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {!hasItems && transaction.type === "EXPENSE" && (
                <div className="transaction-details-card">
                    <div className="transactions-empty">
                        <FaBoxOpen className="empty-icon" />
                        <p>Essa transação não está vinculada a nenhuma compra com produtos.</p>
                    </div>
                </div>
            )}

        </div>
    )
}

export default TransactionDetails