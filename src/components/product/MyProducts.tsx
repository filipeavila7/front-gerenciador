import api from "../../service/api"
import type { PageResponse } from "../../types/pagination/PageResponse";
import type { ProductResponse } from "../../types/product/ProductResponse"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getErrorMessage } from "../utils/GetErrorMessage";
import "../../styles/myProducts.css"

import {
    FaShoppingCart,
    FaShoppingBasket,
    FaBreadSlice,
    FaAppleAlt,
    FaCarrot,
    FaTshirt,
    FaCouch,
    FaLaptop,
    FaGamepad,
    FaPumpSoap,
    FaPaw,
    FaGasPump,
    FaTools,
    FaBoxOpen,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";



const PAGE_SIZE = 12;
const VISIBLE_CARDS = 4;

const ICONS = [
    FaShoppingCart,
    FaShoppingBasket,
    FaBreadSlice,
    FaAppleAlt,
    FaCarrot,
    FaTshirt,
    FaCouch,
    FaLaptop,
    FaGamepad,
    FaPumpSoap,
    FaPaw,
    FaGasPump,
    FaTools,
    FaBoxOpen,
];

// gera sempre o mesmo ícone pro mesmo nome de produto
function getIconForProduct(name: string) {
    const hash = name
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const Icon = ICONS[hash % ICONS.length];
    return Icon;
}

function MyProducts() {
    const { familyId } = useParams();

    const [pageData, setPageData] = useState<PageResponse<ProductResponse> | null>(null);
    const [localGroup, setLocalGroup] = useState(0);
    const [loading, setLoading] = useState(false);

    async function getMyProducts(pageNumber: number, goToLastGroup = false) {
        if (!familyId) return;

        setLoading(true);

        try {
            const res = await api.get<PageResponse<ProductResponse>>(
                `/products/my/family/${familyId}`,
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
        getMyProducts(0);
    }, [familyId]);

    const products = pageData?.content ?? [];
    const groups = Math.max(Math.ceil(products.length / VISIBLE_CARDS), 1);

    const isFirstBackendPage = !pageData || pageData.number === 0;
    const isLastBackendPage = !pageData || pageData.number >= pageData.totalPages - 1;

    const isAtStart = localGroup === 0 && isFirstBackendPage;
    const isAtEnd = localGroup === groups - 1 && isLastBackendPage;

    function handlePrev() {
        if (loading) return;

        if (localGroup > 0) {
            setLocalGroup(prev => prev - 1);
        } else if (pageData && pageData.number > 0) {
            getMyProducts(pageData.number - 1, true);
        }
    }

    function handleNext() {
        if (loading) return;

        if (localGroup < groups - 1) {
            setLocalGroup(prev => prev + 1);
        } else if (pageData && pageData.number < pageData.totalPages - 1) {
            getMyProducts(pageData.number + 1, false);
        }
    }

    return (
        <div className="products-card">

            <div className="products-header">
                <p className="title-2">Produtos cadastrados</p>
                {pageData && (
                    <span className="products-count">
                        {pageData.totalElements} {pageData.totalElements === 1 ? "item" : "itens"}
                    </span>
                )}
            </div>

            {products.length === 0 ? (
                <div className="products-empty">
                    <p>{loading ? "Carregando produtos..." : "Nenhum produto cadastrado ainda."}</p>
                </div>
            ) : (
                <div className="products-carousel-wrapper">

                    <button
                        className="products-arrow"
                        onClick={handlePrev}
                        disabled={isAtStart || loading}
                    >
                        <FaChevronLeft />
                    </button>

                    <div className="products-carousel-track">
                        <div
                            className="products-box"
                            style={{
                                transform: `translateX(-${localGroup * 100}%)`
                            }}
                        >
                            {Array.from({ length: groups }, (_, groupIndex) => (
                                <div className="products-group" key={groupIndex}>
                                    {products
                                        .slice(
                                            groupIndex * VISIBLE_CARDS,
                                            groupIndex * VISIBLE_CARDS + VISIBLE_CARDS
                                        )
                                        .map(product => {
                                            const Icon = getIconForProduct(product.name);
                                            return (
                                                <div className="product-item" key={product.id}>
                                                    <div className="product-icon-box">
                                                        <Icon className="product-icon" />
                                                    </div>
                                                    <p className="product-name">{product.name}</p>
                                                </div>
                                            );
                                        })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className="products-arrow"
                        onClick={handleNext}
                        disabled={isAtEnd || loading}
                    >
                        <FaChevronRight />
                    </button>

                </div>
            )}

            {pageData && pageData.totalPages > 1 && (
                <div className="products-page-indicator">
                    Página {pageData.number + 1} de {pageData.totalPages}
                </div>
            )}

        </div>
    )
}

export default MyProducts