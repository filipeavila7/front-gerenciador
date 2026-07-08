import { useParams } from "react-router-dom"
import api from "../../service/api"
import type { TransactionResponse, TransactionType } from "../../types/transaction/TransactionResponse"
import { useState, useEffect } from "react"
import type { PageResponse } from "../../types/pagination/PageResponse";
import { FaArrowUp, FaArrowDown  } from "react-icons/fa";
import { formatDate } from "../utils/formatDate";

import "../../styles/balance.css"

function TransactionHistory() {
    const { familyId } = useParams();
    const [transactions, setTransactions] = useState<PageResponse<TransactionResponse> | null>(null);

    async function getTransactionHistory() {
        try {
            const res = await api.get<PageResponse<TransactionResponse>>(`/transactions/my/family/${familyId}`);
            setTransactions(res.data)
        }
        catch (error) {
            console.log(error);
        }

    }

    // função para mudar o estilo de seta dependendo da transactionType
    function TransactionIcon({ type }: { type: TransactionType }) {
        if (type === "EXPENSE") {
            return <FaArrowUp color="#E8F994" />;
        }

        return <FaArrowDown color="#bcadf2" />;
    }

    useEffect(() => {
        if (familyId) {
            getTransactionHistory();
        }

    }, [])


    return (
    <div className="transaction-history-box">
        <p className="title-2">Transações recentes</p>
        {transactions?.content.map((t) => (
            <div className="transaction-history" key={t.id}>
                
                <div className="transaction-info">
                    <div className="transaction-history-icon-box">
                        <TransactionIcon type={t.type}/>
                    </div>

                    <div>
                        <p className="transaction-title">{t.title}</p>
                        <p className="transaction-date">{formatDate(t.dateTime)}</p>
                    </div>
                </div>


                <div className="transaction-value">
                    <p>
                        R$ {t.ammount.toFixed(2)}
                    </p>
                </div>

            </div>
        ))}
    </div>
)




}
export default TransactionHistory
