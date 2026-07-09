import { useCountAnimation } from "../utils/UseCountAnimation";
import { FaArrowUp } from "react-icons/fa";

interface MyExpenseProps {
    value: number | undefined;
}

function MyExpense({ value }: MyExpenseProps) {
    const animatedValue = useCountAnimation(value ?? 0);
    return (
        <div className="balance-box">
            <div className="balance-title">
                <p>Despesas</p>
                <h2>R$ {animatedValue.toFixed(2) ?? "0.00"}</h2>
            </div>
            
            <div className="balance-icon-box">
                    <FaArrowUp className="balance-icon" />
                  </div>
            
        </div>
    )
}

export default MyExpense;