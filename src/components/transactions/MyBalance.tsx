import { useParams } from "react-router-dom";
import api from "../../service/api";
import { useState, useEffect } from "react";
import type { BalanceResponse } from "../../types/transaction/BalanceResponse";
import "../../styles/balance.css"
import { LuPiggyBank } from "react-icons/lu";
import { useCountAnimation } from "../utils/useCountAnimation";

function MyBalance() {
  const { familyId } = useParams<{ familyId: string }>();

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const animatedBalance = useCountAnimation(balance);

  useEffect(() => {
    if (!familyId) return;

    async function fetchBalance() {
      setLoading(true);

      try {
        const response = await api.get<BalanceResponse>(
          `transactions/get/balance/family/${familyId}`
        );

        setBalance(response.data.balance);
      } catch (error) {
        console.error("Erro ao buscar balance:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [familyId]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="balance-box">
      <div className="balance-title">
        <p>Saldo atual</p>
        <h2>R$ {animatedBalance.toFixed(2)}</h2>
      </div>
      <div className="balance-icon-box">
        <LuPiggyBank className="balance-icon" />
      </div>
      
      
    </div>
  );
}

export default MyBalance;