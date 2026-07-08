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

interface CategoryExpenseResponse {
    category: string;
    total: number;
}

interface Props {
    familyId: string | undefined;
    year: number;
    month: number;
}

// stops do degradê: roxo clarinho -> roxo -> amarelo 
const GRADIENT_STOPS = ["#8b7fd6", "#c9bde0", "#E8F994"];

function hexToRgb(hex: string) {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function rgbToHex(r: number, g: number, b: number) {
    return (
        "#" +
        [r, g, b]
            .map(v => Math.round(v).toString(16).padStart(2, "0"))
            .join("")
    );
}

// t vai de 0 a 1, percorrendo os stops do degradê
function interpolateColor(t: number) {
    const stops = GRADIENT_STOPS.map(hexToRgb);
    const segments = stops.length - 1;
    const scaledT = t * segments;
    const index = Math.min(Math.floor(scaledT), segments - 1);
    const localT = scaledT - index;

    const start = stops[index];
    const end = stops[index + 1];

    const r = start.r + (end.r - start.r) * localT;
    const g = start.g + (end.g - start.g) * localT;
    const b = start.b + (end.b - start.b) * localT;

    return rgbToHex(r, g, b);
}

function generatePalette(count: number) {
    if (count <= 1) return [GRADIENT_STOPS[0]];

    return Array.from({ length: count }, (_, i) =>
        interpolateColor(i / (count - 1))
    );
}

function CategoryGraphic({
    familyId,
    year,
    month
}: Props) {

    const [data, setData] = useState<CategoryExpenseResponse[]>([]);

    useEffect(() => {

        async function loadExpenses() {

            if (!familyId) return;

            try {

                const response = await api.get<CategoryExpenseResponse[]>(
                    "/graphic/category-expenses",
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

    const palette = generatePalette(data.length);

    const chartData = data.map((item, index) => ({
        name: item.category,
        value: Number(item.total),
        percentage: total > 0 ? ((Number(item.total) / total) * 100).toFixed(1) : "0",
        color: palette[index]
    }));

    const formattedTotal = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    return (

        <div className="graph-card">
            <p className="title-2">Gastos por categoria</p>

            {chartData.length === 0 ? (
                <div className="graph-empty">
                    <p>Nenhum gasto registrado neste período.</p>
                </div>
            ) : (
                <div className="graph-body">

                    <div className="graph-chart-box">

                        <ResponsiveContainer width="100%" height={220}>
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
                                        chartData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))
                                    }
                                </Pie>

                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#14152b",
                                        border: "1px solid #a5a3ab57",
                                        borderRadius: "10px",
                                        color: "#ffffff"
                                    }}
                                    itemStyle={{ color: "#bcadf2" }}
                                    formatter={(value, name) => {
                                        const numericValue = Number(value ?? 0);
                                        const formatted = numericValue.toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL"
                                        });
                                        return [formatted, name];
                                    }}
                                />

                            </PieChart>
                        </ResponsiveContainer>

                        <div className="graph-center-label">
                            <span className="graph-total-value">{formattedTotal}</span>
                            <span className="graph-total-caption">Total</span>
                        </div>

                    </div>

                    <div className="graph-legend">
                        {chartData.map((entry, index) => (
                            <div className="graph-legend-row" key={index}>
                                <div className="graph-legend-label">
                                    <span
                                        className="graph-legend-dot"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="graph-legend-name">{entry.name}</span>
                                </div>

                                <span className="graph-legend-value">
                                    {entry.value.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL"
                                    })}
                                </span>

                                <span className="graph-legend-percentage">
                                    {entry.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            )}

        </div>
    )
}

export default CategoryGraphic;