import { useState, useEffect, useRef } from "react";
import api from "../../service/api";
import type { PageResponse } from "../../types/pagination/PageResponse";
import type { ProductResponse } from "../../types/product/ProductResponse";
import type { PurchaseManyItensRequest } from "../../types/purchase/PurchaseManyItensRequest";
import { getErrorMessage } from "../utils/GetErrorMessage";

import {
    FaTimes,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaPlus,
    FaMinus,
    FaBoxOpen,
    FaShoppingCart
} from "react-icons/fa";

import "../../styles/purchaseModals.css";

interface Props {
    familyId: string;
    purchaseId: string;
    existingProductIds: number[];
    onClose: () => void;
    onAdded: () => void;
}


interface CartItem {
    productId: number;
    name: string;
    quantity: number;
    unitPrice: number;
}

const PAGE_SIZE = 12;

function AddProductModal({ familyId, purchaseId, existingProductIds, onClose, onAdded }: Props) {

    const [pageData, setPageData] = useState<PageResponse<ProductResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [cart, setCart] = useState<Map<number, CartItem>>(new Map());
    const [submitting, setSubmitting] = useState(false);

    const requestIdRef = useRef(0);

    useEffect(() => {
        let ignore = false;
        const currentRequestId = ++requestIdRef.current;

        async function loadProducts() {
            setLoading(true);

            try {
                const res = await api.get<PageResponse<ProductResponse>>(
                    `/products/my/family/${familyId}`,
                    { params: { page, size: PAGE_SIZE } }
                );

                if (!ignore && currentRequestId === requestIdRef.current) {
                    setPageData(res.data);
                }
            } catch (err) {
                if (!ignore) setErrorMsg(getErrorMessage(err));
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadProducts();

        return () => { ignore = true; };
    }, [familyId, page]);

    const products = pageData?.content ?? [];

    const filteredProducts = search.trim()
        ? products.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()))
        : products;

    function addToCart(product: ProductResponse) {
        setCart(prev => {
            const next = new Map(prev);
            if (!next.has(product.id)) {
                next.set(product.id, {
                    productId: product.id,
                    name: product.name,
                    quantity: 1,
                    unitPrice: 0
                });
            }
            return next;
        });
    }

    function removeFromCart(productId: number) {
        setCart(prev => {
            const next = new Map(prev);
            next.delete(productId);
            return next;
        });
    }

    function updateCartItem(productId: number, field: "quantity" | "unitPrice", value: number) {
        setCart(prev => {
            const next = new Map(prev);
            const item = next.get(productId);
            if (item) {
                next.set(productId, { ...item, [field]: value });
            }
            return next;
        });
    }

    async function handleSubmit() {
        if (cart.size === 0) return;

        const items = Array.from(cart.values());
        const invalid = items.some(i => i.quantity <= 0 || i.unitPrice < 0);

        if (invalid) {
            setErrorMsg("Quantidade deve ser maior que zero e preço não pode ser negativo.");
            return;
        }

        setSubmitting(true);
        setErrorMsg(null);

        try {
            const payload: PurchaseManyItensRequest = {
                itensRequests: items.map(i => ({
                    productId: i.productId,
                    unitPrice: i.unitPrice,
                    quantity: i.quantity
                }))
            };

            await api.post(
                `/purchase/add/family/${familyId}/purchase/${purchaseId}/many`,
                payload
            );

            onAdded();
            onClose();
        } catch (err) {
            setErrorMsg(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box modal-box-wide" onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <h2>Adicionar produtos</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-search">
                    <FaSearch className="modal-search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar produto..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="modal-body-split">

                    <div className="modal-product-list">

                        {loading && !pageData ? (
                            <div className="modal-empty"><p>Carregando produtos...</p></div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="modal-empty">
                                <FaBoxOpen className="empty-icon" />
                                <p>Nenhum produto encontrado.</p>
                            </div>
                        ) : (
                            filteredProducts.map(product => {
                                const inCart = cart.has(product.id);
                                const alreadyInPurchase = existingProductIds.includes(product.id);
                                const isDisabled = inCart || alreadyInPurchase;

                                return (
                                    <button
                                        key={product.id}
                                        className={`modal-product-row ${inCart ? "product-in-cart" : ""} ${alreadyInPurchase ? "product-already-added" : ""}`}
                                        onClick={() => addToCart(product)}
                                        disabled={isDisabled}
                                    >
                                        <span>{product.name}</span>
                                        {alreadyInPurchase ? (
                                            <span className="already-added-tag">Já na compra</span>
                                        ) : inCart ? (
                                            <span className="in-cart-tag">Adicionado</span>
                                        ) : (
                                            <FaPlus />
                                        )}
                                    </button>
                                );
                            })
                        )}

                        {pageData && pageData.totalPages > 1 && (
                            <div className="modal-pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(p - 1, 0))}
                                    disabled={pageData.number === 0 || loading}
                                >
                                    <FaChevronLeft />
                                </button>
                                <span>{pageData.number + 1} / {pageData.totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(p + 1, pageData.totalPages - 1))}
                                    disabled={pageData.number >= pageData.totalPages - 1 || loading}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        )}

                    </div>

                    <div className="modal-cart">

                        <div className="modal-cart-header">
                            <FaShoppingCart />
                            <span>Selecionados ({cart.size})</span>
                        </div>

                        {cart.size === 0 ? (
                            <div className="modal-empty">
                                <p>Clique em um produto ao lado para adicionar.</p>
                            </div>
                        ) : (
                            <div className="modal-cart-list">
                                {Array.from(cart.values()).map(item => (
                                    <div className="modal-cart-item" key={item.productId}>

                                        <div className="modal-cart-item-top">
                                            <span className="modal-cart-item-name">{item.name}</span>
                                            <button
                                                className="modal-cart-remove"
                                                onClick={() => removeFromCart(item.productId)}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>

                                        <div className="modal-cart-item-fields">

                                            <div className="modal-field">
                                                <label>Qtd</label>
                                                <div className="qty-input">
                                                    <button
                                                        onClick={() => updateCartItem(item.productId, "quantity", Math.max(item.quantity - 1, 1))}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={e => updateCartItem(item.productId, "quantity", Number(e.target.value))}
                                                    />
                                                    <button
                                                        onClick={() => updateCartItem(item.productId, "quantity", item.quantity + 1)}
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="modal-field">
                                                <label>Preço unit.</label>
                                                <input
                                                    className="price-input"
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={e => updateCartItem(item.productId, "unitPrice", Number(e.target.value))}
                                                />
                                            </div>

                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                </div>

                {errorMsg && <div className="modal-error">{errorMsg}</div>}

                <div className="modal-footer">
                    <button className="modal-cancel-btn" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="modal-confirm-btn"
                        onClick={handleSubmit}
                        disabled={cart.size === 0 || submitting}
                    >
                        {submitting ? "Adicionando..." : `Adicionar ${cart.size > 0 ? `(${cart.size})` : ""}`}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default AddProductModal