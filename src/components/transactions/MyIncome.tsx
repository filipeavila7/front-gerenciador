import { FaArrowDown } from "react-icons/fa";
import { useCountAnimation } from "../utils/UseCountAnimation";

interface MyIncomeProps {
    value: number | undefined;
}

function MyIncome({ value }: MyIncomeProps) {
    const animatedValue = useCountAnimation(value ?? 0);
    return (
            <div className="balance-box">
                <div className="balance-title">
                    <p>Receitas</p>
                    <h2>R$ {animatedValue.toFixed(2) ?? "0.00"}</h2>
                </div>
                
                <div className="balance-icon-box">
                        <FaArrowDown className="balance-icon" />
                      </div>
                
            </div>
        )
}

export default MyIncome;