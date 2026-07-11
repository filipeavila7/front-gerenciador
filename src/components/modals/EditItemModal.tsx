import { useState } from "react";
import api from "../../service/api";
import type { PurchaseItemResponse } from "../../types/purchase/PurchaseItensResponse";
import type { PurchaseItenUpdateRequest } from "../../types/purchase/PurchaseItenUpdateRequest";
import { getErrorMessage } from "../utils/GetErrorMessage";
import { FaTimes } from "react-icons/fa";

import "../../styles/purchaseModals.css";

interface Props {
    familyId: string;
    purchaseId: string;
    item: PurchaseItemResponse;
    onClose: () => void;
    onUpdated: () => void;
}

function EditItemModal({ familyId, purchaseId, item, onClose, onUpdated }: Props) {

    const [quantity, setQuantity] = useState(item.quantity);
    const [unitPrice, setUnitPrice] = useState(item.unitPrice);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSubmit() {
        if (quantity <= 0 || unitPrice < 0) {
            setErrorMsg("Quantidade deve ser maior que zero e preço não pode ser negativo.");
            return;
        }

        setSubmitting(true);
        setErrorMsg(null);

        try {
            const payload: PurchaseItenUpdateRequest = { quantity, unitPrice };

            await api.put(
                `/purchase/update/family/${familyId}/purchase/${purchaseId}/product/${item.productId}`,
                payload
            );

            onUpdated();
            onClose();
        } catch (err) {
            setErrorMsg(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box modal-box-small" onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <h2>Editar item</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <p className="modal-item-name">{item.productName}</p>

                <div className="modal-form">
                    <div className="modal-field">
                        <label>Quantidade</label>
                        <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                        />
                    </div>

                    <div className="modal-field">
                        <label>Preço unitário</label>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={unitPrice}
                            onChange={e => setUnitPrice(Number(e.target.value))}
                        />
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
                        disabled={submitting}
                    >
                        {submitting ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default EditItemModal