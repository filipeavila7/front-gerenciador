import { useParams } from "react-router-dom";
import { useState } from "react";
import TransactionExpenseChart from "../components/graphics/TransactionExpenseChart";
import "../styles/graphic.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CategoryGraphic from "../components/graphics/CategoryGraphic";
import ProductGraphic from "../components/graphics/ProductGraphic";


const MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];


function Graphics() {

    const { familyId } = useParams();


    const today = new Date();


    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());


    const monthName = MONTHS[month - 1];


    function nextMonth() {

        if (month === 12) {

            setMonth(1);
            setYear(year + 1);

        } else {

            setMonth(month + 1);

        }

    }


    function previousMonth() {

        if (month === 1) {

            setMonth(12);
            setYear(year - 1);

        } else {

            setMonth(month - 1);

        }

    }


    return (
        <div className="graphic-lay">


            <div className="product-header">

                <div className="product-title-box">

                    <h1>Gráficos</h1>

                    <p>
                        Acompanhe os dados financeiros da sua família.
                    </p>

                </div>



                <div className="product-header-actions">


                    <div className="btn-header-box">


                        <button onClick={previousMonth}>
                            <FaChevronLeft />
                        </button>


                        <span>
                            {monthName} {year}
                        </span>


                        <button
                            onClick={nextMonth}
                            disabled={
                                year === today.getFullYear() &&
                                month === today.getMonth() + 1
                            }
                        >
                            <FaChevronRight />
                        </button>


                    </div>


                </div>


            </div>



            <div className="graphic-grid">


                {familyId && (

                    <>
                        <TransactionExpenseChart
                            familyId={Number(familyId)}
                            year={year}

                        />


                        <CategoryGraphic
                            familyId={familyId}
                            year={year}
                            month={month}
                        />

                        <ProductGraphic
                            familyId={familyId}
                            year={year}
                            month={month}
                        />


                    </>



                )}


            </div>


        </div>
    );
}


export default Graphics;