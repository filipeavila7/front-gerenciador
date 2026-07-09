import api from "../../service/api"
import type { PageResponse } from "../../types/pagination/PageResponse";
import type { CategoryResponse } from "../../types/category/CategoryResponse"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getErrorMessage } from "../utils/GetErrorMessage";

import {
    FaUtensils,
    FaHome,
    FaCar,
    FaHeartbeat,
    FaGamepad,
    FaGraduationCap,
    FaPlane,
    FaFilm,
    FaDumbbell,
    FaGift,
    FaWallet,
    FaTshirt,
    FaPaw,
    FaEllipsisH,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";

import "../../styles/myCategory.css";

const PAGE_SIZE = 12;
const VISIBLE_CARDS = 4;

const ICONS = [
    FaUtensils,
    FaHome,
    FaCar,
    FaHeartbeat,
    FaGamepad,
    FaGraduationCap,
    FaPlane,
    FaFilm,
    FaDumbbell,
    FaGift,
    FaWallet,
    FaTshirt,
    FaPaw,
    FaEllipsisH,
];

// gera sempre o mesmo ícone pro mesmo nome de categoria
function getIconForCategory(name: string) {
    const hash = name
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const Icon = ICONS[hash % ICONS.length];
    return Icon;
}

function MyCategory() {
    const { familyId } = useParams();

    const [pageData, setPageData] = useState<PageResponse<CategoryResponse> | null>(null);
    const [localGroup, setLocalGroup] = useState(0);
    const [loading, setLoading] = useState(false);

    async function getMyCategories(pageNumber: number, goToLastGroup = false) {
        if (!familyId) return;

        setLoading(true);

        try {
            const res = await api.get<PageResponse<CategoryResponse>>(
                `/category/my/family/${familyId}`,
                {
                    params: {
                        page: pageNumber,
                        size: PAGE_SIZE
                    }
                }
            );

            setPageData(res.data);

            const groups = Math.max(Math.ceil(res.data.content.length / VISIBLE_CARDS), 1);
            setLocalGroup(goToLastGroup ? groups - 1 : 0);

        } catch (err) {
            console.log(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getMyCategories(0);
    }, [familyId]);

    const categories = pageData?.content ?? [];
    const groups = Math.max(Math.ceil(categories.length / VISIBLE_CARDS), 1);

    const isFirstBackendPage = !pageData || pageData.number === 0;
    const isLastBackendPage = !pageData || pageData.number >= pageData.totalPages - 1;

    const isAtStart = localGroup === 0 && isFirstBackendPage;
    const isAtEnd = localGroup === groups - 1 && isLastBackendPage;

    function handlePrev() {
        if (loading) return;

        if (localGroup > 0) {
            setLocalGroup(prev => prev - 1);
        } else if (pageData && pageData.number > 0) {
            getMyCategories(pageData.number - 1, true);
        }
    }

    function handleNext() {
        if (loading) return;

        if (localGroup < groups - 1) {
            setLocalGroup(prev => prev + 1);
        } else if (pageData && pageData.number < pageData.totalPages - 1) {
            getMyCategories(pageData.number + 1, false);
        }
    }

    return (
        <div className="category-card">

            <div className="category-header">
                <p className="title-2">Categorias cadastradas</p>
                {pageData && (
                    <span className="category-count">
                        {pageData.totalElements} {pageData.totalElements === 1 ? "item" : "itens"}
                    </span>
                )}
            </div>

            {categories.length === 0 ? (
                <div className="category-empty">
                    <p>{loading ? "Carregando categorias..." : "Nenhuma categoria cadastrada ainda."}</p>
                </div>
            ) : (
                <div className="category-carousel-wrapper">

                    <button
                        className="category-arrow"
                        onClick={handlePrev}
                        disabled={isAtStart || loading}
                    >
                        <FaChevronLeft />
                    </button>

                    <div className="category-carousel-track">
                        <div
                            className="category-box"
                            style={{
                                transform: `translateX(-${localGroup * 100}%)`
                            }}
                        >
                            {Array.from({ length: groups }, (_, groupIndex) => (
                                <div className="category-group" key={groupIndex}>
                                    {categories
                                        .slice(
                                            groupIndex * VISIBLE_CARDS,
                                            groupIndex * VISIBLE_CARDS + VISIBLE_CARDS
                                        )
                                        .map(category => {
                                            const Icon = getIconForCategory(category.name);
                                            return (
                                                <div className="category-item" key={category.id}>
                                                    <div className="category-icon-box">
                                                        <Icon className="category-icon" />
                                                    </div>
                                                    <p className="category-name">{category.name}</p>
                                                </div>
                                            );
                                        })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className="category-arrow"
                        onClick={handleNext}
                        disabled={isAtEnd || loading}
                    >
                        <FaChevronRight />
                    </button>

                </div>
            )}

            {pageData && pageData.totalPages > 1 && (
                <div className="category-page-indicator">
                    Página {pageData.number + 1} de {pageData.totalPages}
                </div>
            )}

        </div>
    )
}

export default MyCategory