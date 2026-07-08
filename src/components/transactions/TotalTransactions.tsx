import { useParams } from "react-router-dom";
import api from "../../service/api";
import { useState, useEffect } from "react";
import { MdAttachMoney } from "react-icons/md";
import { useCountAnimation } from "../utils/useCountAnimation";
import { getErrorMessage } from "../utils/getErrorMessage";

function TotalTransactions() {

    const { familyId } = useParams();

    const [total, setTotal] = useState(0);


    const animatedTotal = useCountAnimation(total);


    async function getTotal() {

        try {

            const res = await api.get<number>(
                `/transactions/total/family/${familyId}`
            );

            setTotal(res.data);

        } catch (error) {
            console.log(getErrorMessage(error));
        }
    }


    useEffect(() => {

        if (familyId) {
            getTotal();
        }

    }, [familyId]);


    return (
        <div className="balance-box">

            <div className="balance-title">

                <p>Transações feitas</p>

                <h2>
                    {animatedTotal}
                </h2>

            </div>


            <div className="balance-icon-box">
                <MdAttachMoney className="balance-icon" />
            </div>

        </div>
    );
}

export default TotalTransactions;