import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../service/api";
import type { FamilyResponse } from "../../types/family/FamilyResponse";


function Greeting() {
    const { familyId } = useParams<{ familyId: string }>();

    const [family, setFamily] = useState<FamilyResponse | null>(null);

    useEffect(() => {
        if (!familyId) return;

        async function getFamily() {
            try {
                const response = await api.get<FamilyResponse>(
                    `/families/my/family/${familyId}`
                );

                setFamily(response.data);

            } catch (error) {
                console.error("Erro ao buscar família:", error);
            }
        }

        getFamily();

    }, [familyId]);


    function getGreeting() {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return "Bom dia";
        }

        if (hour >= 12 && hour < 18) {
            return "Boa tarde";
        }

        return "Boa noite";
    }


    return (
        <div>
            <h2>
                <span style={{ color: "#b9a6f0" }}>
                    {getGreeting()},
                </span>{" "}
                <span style={{ color: "#eef299" }}>
                   família { family?.name ?? "usuário"}!
                </span>
            </h2>
        </div>
    );
}

export default Greeting;