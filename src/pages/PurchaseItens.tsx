import { useParams } from "react-router-dom";
import api from "../service/api";
import { useState, useEffect, useRef } from "react";

import type { PurchaseItemResponse } from "../types/purchase/PurchaseItensResponse";
import type { PurchaseResponse } from "../types/purchase/PurchaseResponse";
import type { PageResponse } from "../types/pagination/PageResponse";

import { getErrorMessage } from "../components/utils/GetErrorMessage";

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
    FaChevronRight,
    FaBoxOpen
} from "react-icons/fa";

import "../styles/purchases.css";


const CATEGORY_ICONS = [
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


function getIconForCategory(name: string) {
    const hash = name
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return CATEGORY_ICONS[hash % CATEGORY_ICONS.length];
}


function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function formatDate(dateTime: string) {
    return new Date(dateTime).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}



function PurchaseItens() {

    const { familyId, purchaseId } = useParams();


    const [purchase, setPurchase] = useState<PurchaseResponse | null>(null);

    const [pageData, setPageData] =
        useState<PageResponse<PurchaseItemResponse> | null>(null);


    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(false);

    const [loadingPurchase, setLoadingPurchase] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);


    const requestIdRef = useRef(0);



    async function loadPurchase() {

        if (!familyId || !purchaseId) return;


        setLoadingPurchase(true);


        try {

            const res = await api.get<PurchaseResponse>(
                `/purchase/my/family/${familyId}/purchase/${purchaseId}`
            );


            setPurchase(res.data);


        } catch(err) {

            console.log(getErrorMessage(err));

        } finally {

            setLoadingPurchase(false);

        }
    }




    async function loadItens() {

        if (!familyId || !purchaseId) return;


        setLoading(true);
        setErrorMsg(null);


        const currentRequestId = ++requestIdRef.current;


        try {


            const res = await api.get<PageResponse<PurchaseItemResponse>>(
                `/purchase/my/family/${familyId}/purchase/${purchaseId}/itens`,
                {
                    params:{
                        page,
                        size:12
                    }
                }
            );


            if(currentRequestId === requestIdRef.current){

                setPageData(res.data);

            }


        }catch(err){

            setErrorMsg(getErrorMessage(err));

        }finally{

            setLoading(false);

        }

    }




    useEffect(() => {

        loadPurchase();

    }, [familyId, purchaseId]);



    useEffect(() => {

        loadItens();

    }, [familyId, purchaseId, page]);





    const items = pageData?.content ?? [];


    const canEdit = purchase?.status === "OPEN";



    return (

        <div className="purchase-itens-page">

            <div className="purchase-itens-lay">


                <div className="purchase-itens-header">


                    <div className="purchase-itens-title">


                        <h2>
                            {purchase?.name ?? "Itens da compra"}
                        </h2>


                        {purchase?.dateTime && (

                            <span className="purchase-itens-date">

                                {formatDate(purchase.dateTime)}

                            </span>

                        )}



                    </div>




                    {purchase && (

                        <div className="purchase-itens-total">


                            <span className="total-label">
                                Total
                            </span>


                            <span className="total-value">

                                {formatCurrency(purchase.total)}

                            </span>


                        </div>

                    )}



                </div>




                {purchase && (

                    <div className="purchase-status">

                        {purchase.status === "OPEN"
                            ? "Em aberto"
                            : "Concluída"
                        }

                    </div>

                )}






                {canEdit && (

                    <button className="edit-purchase-btn">

                        Editar compra

                    </button>

                )}






                {pageData && (

                    <div className="purchase-itens-count">

                        {pageData.totalElements}

                        {" "}

                        {pageData.totalElements === 1
                            ? "produto"
                            : "produtos"
                        }

                    </div>

                )}






                {errorMsg ? (

                    <div className="purchase-itens-empty">

                        <p>{errorMsg}</p>

                    </div>


                ) : loading && !pageData ? (

                    <div className="purchase-itens-empty">

                        <p>Carregando produtos...</p>

                    </div>


                ) : items.length === 0 ? (

                    <div className="purchase-itens-empty">

                        <FaBoxOpen className="empty-icon"/>

                        <p>
                            Nenhum produto encontrado nessa compra.
                        </p>

                    </div>


                ) : (

                    <div className={`purchase-itens-list ${loading ? "list-loading" : ""}`}>



                        {items.map(item => {


                            const Icon =
                                getIconForCategory(item.categoryName);



                            return (

                                <div
                                    className="purchase-item-row"
                                    key={item.productId}
                                >


                                    <div className="item-icon-box">

                                        <Icon />

                                    </div>



                                    <div className="item-info">

                                        <span className="item-name">

                                            {item.productName}

                                        </span>


                                        <span className="item-category">

                                            {item.categoryName}

                                        </span>


                                    </div>



                                    <div className="item-quantity">

                                        {item.quantity}x

                                    </div>



                                    <div className="item-unit-price">

                                        {formatCurrency(item.unitPrice)}

                                    </div>



                                    <div className="item-subtotal">

                                        {formatCurrency(item.subtotal)}

                                    </div>


                                </div>

                            )

                        })}



                    </div>

                )}







                {pageData && pageData.totalPages > 1 && (

                    <div className="purchase-itens-pagination">


                        <button
                            onClick={() =>
                                setPage(p => Math.max(p - 1, 0))
                            }
                            disabled={
                                pageData.number === 0 ||
                                loading
                            }
                        >

                            <FaChevronLeft />

                            Anterior

                        </button>





                        <span>

                            Página {pageData.number + 1}

                            {" "}de{" "}

                            {pageData.totalPages}

                        </span>





                        <button

                            onClick={() =>
                                setPage(p =>
                                    Math.min(
                                        p + 1,
                                        pageData.totalPages - 1
                                    )
                                )
                            }

                            disabled={
                                pageData.number >= pageData.totalPages - 1 ||
                                loading
                            }

                        >

                            Próxima

                            <FaChevronRight />

                        </button>



                    </div>

                )}



            </div>

        </div>

    )
}


export default PurchaseItens;