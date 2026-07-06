import { useParams } from "react-router-dom";
import api from "../../service/api";
import { useState, useEffect } from "react";
import type { BalanceResponse } from "../../types/transaction/BalanceResponse";

function MyBalance() {
  const { familyId } = useParams<{ familyId: string }>();

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

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
    <div>
      <h2>Saldo atual</h2>
      <p>R$ {balance.toFixed(2)}</p>
    </div>
  );
}

export default MyBalance;