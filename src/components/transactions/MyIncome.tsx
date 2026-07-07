import { FaArrowDown } from "react-icons/fa";

interface MyIncomeProps {
    value: number | undefined;
}

function MyIncome({ value }: MyIncomeProps) {

    return (
            <div className="balance-box">
                <div className="balance-title">
                    <p>Receitas</p>
                    <h2>R$ {value?.toFixed(2) ?? "0.00"}</h2>
                </div>
                
                <div className="balance-icon-box">
                        <FaArrowDown className="balance-icon" />
                      </div>
                
            </div>
        )
}

export default MyIncome;