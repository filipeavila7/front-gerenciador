
import { FaArrowUp } from "react-icons/fa";

interface MyExpenseProps {
    value: number | undefined;
}

function MyExpense({ value }: MyExpenseProps) {

    return (
        <div className="balance-box">
            <div className="balance-title">
                <p>Despesas</p>
                <h2>R$ {value?.toFixed(2) ?? "0.00"}</h2>
            </div>
            
            <div className="balance-icon-box">
                    <FaArrowUp className="balance-icon" />
                  </div>
            
        </div>
    )
}

export default MyExpense;