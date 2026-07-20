import "../../styles/transaction-expense.css"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from "recharts";
import {
    useCallback,
    useEffect,
    useState
} from "react";
import api from "../../service/api";

interface Props {
    familyId: number;
    year: number;
}

interface TransactionMonthResponse {
    month: number;
    total: number;
}

const MONTHS = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"
];

const COLORS = [
    "#E8F994",
    "#cabdf5",
    "#bcadf2"
];

export default function TransactionExpenseChart({
    familyId,
    year
}: Props) {

    const [data, setData] = useState<TransactionMonthResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);

        try {

            const response = await api.get<TransactionMonthResponse[]>(
                "/graphic/transaction-expenses",
                {
                    params: {
                        familyId,
                        year
                    }
                }
            );

            const months = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: 0
            }));

            response.data.forEach(item => {
                months[item.month - 1] = item;
            });

            setData(months);

        } finally {
            setLoading(false);
        }
    }, [familyId, year]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="transaction-chart loading">
                Carregando gráfico...
            </div>
        );
    }

    return (
        <div className="transaction-chart">

            <div className="chart-header">
                <h3>Despesas por mês</h3>
                <span>{year}</span>
            </div>

            <div className="transaction-chart-scroll">
                <div className="transaction-chart-canvas">
                    <ResponsiveContainer width="100%" height={350}>

                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 5,
                                bottom: 5
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="4 4"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="month"
                                tickFormatter={(value) => MONTHS[value - 1]}
                                tick={{ fill: "#B7B7C9" }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <YAxis
                                width={90}
                                domain={[0, (dataMax: number) => Math.max(10000, Math.ceil(dataMax / 1000) * 1000)]}
                                tick={{ fill: "#B7B7C9" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) =>
                                    `R$ ${value.toLocaleString("pt-BR")}`
                                }
                            />

                            <Tooltip
                                cursor={{ fill: "rgba(165,148,249,.15)" }}
                                formatter={(value) =>
                                    `R$ ${Number(value ?? 0).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2
                                    })}`
                                }
                                labelFormatter={(label) => MONTHS[Number(label) - 1]}
                            />

                            <Bar
                                dataKey="total"
                                radius={[10, 10, 0, 0]}
                                animationDuration={1400}
                                animationEasing="ease-out"
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>

                        </BarChart>

                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
