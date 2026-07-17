import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import api from "../../service/api";
import "../../styles/categoryGraphic.css";


interface ProductExpenseResponse {
    productName: string;
    total: number;
}


interface Props {
    familyId: string | undefined;
    year: number;
    month: number;
}


const COLORS = [
    "#8b7fd6",
    "#c9bde0",
    "#E8F994",
    "#bcadf2",
    "#cabdf5"
];


function ProductGraphic({
    familyId,
    year,
    month
}: Props) {


    const [data, setData] = useState<ProductExpenseResponse[]>([]);


    useEffect(() => {

        async function loadExpenses() {

            if (!familyId) return;


            try {

                const response = await api.get<ProductExpenseResponse[]>(
                    "/graphic/product-expenses",
                    {
                        params: {
                            familyId,
                            year,
                            month
                        }
                    }
                );


                setData(response.data);


            } catch (error) {

                console.log(error);

            }

        }


        loadExpenses();


    }, [familyId, year, month]);



    const total = data.reduce(
        (acc, item) => acc + Number(item.total),
        0
    );



    const chartData = data.map((item, index) => ({

        name: item.productName,

        value: Number(item.total),

        percentage:
            total > 0
                ? ((Number(item.total) / total) * 100).toFixed(1)
                : "0",

        color: COLORS[index % COLORS.length]

    }));



    const formattedTotal = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });



    return (

        <div className="graph-card">

            <p className="title-2">
                Gastos por produto
            </p>


            {
                chartData.length === 0 ? (

                    <div className="graph-empty">

                        <p>
                            Nenhum gasto registrado neste período.
                        </p>

                    </div>

                ) : (


                    <div className="graph-body">


                        <div className="graph-chart-box">


                            <ResponsiveContainer
                                width="100%"
                                height={220}
                            >

                                <PieChart>


                                    <Pie

                                        data={chartData}

                                        dataKey="value"

                                        nameKey="name"

                                        innerRadius={65}

                                        outerRadius={100}

                                        paddingAngle={2}

                                        stroke="none"

                                    >

                                        {
                                            chartData.map((entry,index)=>(

                                                <Cell
                                                    key={index}
                                                    fill={entry.color}
                                                />

                                            ))
                                        }


                                    </Pie>



                                    <Tooltip

                                        contentStyle={{
                                            backgroundColor:"#14152b",
                                            border:"1px solid #a5a3ab57",
                                            borderRadius:"10px",
                                            color:"#ffffff"
                                        }}

                                        itemStyle={{
                                            color:"#bcadf2"
                                        }}


                                        formatter={(value)=>{

                                            const numericValue =
                                                Number(value ?? 0);


                                            return [
                                                numericValue.toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        style:"currency",
                                                        currency:"BRL"
                                                    }
                                                ),
                                                "Valor"
                                            ];

                                        }}

                                    />


                                </PieChart>


                            </ResponsiveContainer>



                            <div className="graph-center-label">


                                <span className="graph-total-value">

                                    {formattedTotal}

                                </span>


                                <span className="graph-total-caption">

                                    Total

                                </span>


                            </div>


                        </div>




                        <div className="graph-legend">


                            {
                                chartData.map((entry,index)=>(

                                    <div
                                        className="graph-legend-row"
                                        key={index}
                                    >

                                        <div className="graph-legend-label">


                                            <span

                                                className="graph-legend-dot"

                                                style={{
                                                    backgroundColor:
                                                        entry.color
                                                }}

                                            />


                                            <span className="graph-legend-name">

                                                {entry.name}

                                            </span>


                                        </div>



                                        <span className="graph-legend-value">

                                            {entry.value.toLocaleString(
                                                "pt-BR",
                                                {
                                                    style:"currency",
                                                    currency:"BRL"
                                                }
                                            )}

                                        </span>



                                        <span className="graph-legend-percentage">

                                            {entry.percentage}%

                                        </span>


                                    </div>

                                ))
                            }


                        </div>


                    </div>

                )
            }


        </div>

    );

}


export default ProductGraphic;