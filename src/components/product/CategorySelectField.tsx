import { useState, useEffect, useRef } from "react";
import api from "../../service/api";
import type { PageResponse } from "../../types/pagination/PageResponse";
import type { CategoryResponse } from "../../types/category/CategoryResponse";
import { getErrorMessage } from "../utils/GetErrorMessage";
import { FaChevronDown, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
    familyId: string;
    value: number | null;
    valueName?: string;
    onChange: (categoryId: number, categoryName: string) => void;
}

const CATEGORY_PAGE_SIZE = 12;

function CategorySelectField({ familyId, value, valueName, onChange }: Props) {

    const [open, setOpen] = useState(false);
    const [pageData, setPageData] = useState<PageResponse<CategoryResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    useEffect(() => {
        if (!open || !familyId) return;

        let ignore = false;

        async function loadCategories() {
            setLoading(true);

            try {
                const res = await api.get<PageResponse<CategoryResponse>>(
                    `/category/my/family/${familyId}`,
                    { params: { page, size: CATEGORY_PAGE_SIZE } }
                );

                if (!ignore) setPageData(res.data);
            } catch (err) {
                console.log(getErrorMessage(err));
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadCategories();

        return () => { ignore = true; };
    }, [open, familyId, page]);

    const categories = pageData?.content ?? [];

    const filteredCategories = search.trim()
        ? categories.filter(c => c.name.toLowerCase().includes(search.trim().toLowerCase()))
        : categories;

    function handleSelect(category: CategoryResponse) {
        onChange(category.id, category.name);
        setOpen(false);
    }

    return (
        <div className="category-select-wrapper" ref={wrapperRef}>
            <button
                type="button"
                className="category-select-trigger"
                onClick={() => setOpen(prev => !prev)}
            >
                <span className={value ? "" : "category-select-placeholder"}>
                    {valueName ?? "Selecione uma categoria"}
                </span>
                <FaChevronDown className={`category-select-chevron ${open ? "chevron-open" : ""}`} />
            </button>

            {open && (
                <div className="category-select-dropdown">

                    <div className="modal-search category-select-search">
                        <FaSearch className="modal-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar categoria..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="category-select-list">
                        {loading && !pageData ? (
                            <div className="modal-empty"><p>Carregando...</p></div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="modal-empty"><p>Nenhuma categoria encontrada.</p></div>
                        ) : (
                            filteredCategories.map(category => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={`modal-product-row ${category.id === value ? "category-option-selected" : ""}`}
                                    onClick={() => handleSelect(category)}
                                >
                                    <span>{category.name}</span>
                                </button>
                            ))
                        )}
                    </div>

                    {pageData && pageData.totalPages > 1 && (
                        <div className="modal-pagination">
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.max(p - 1, 0))}
                                disabled={pageData.number === 0 || loading}
                            >
                                <FaChevronLeft />
                            </button>
                            <span>{pageData.number + 1} / {pageData.totalPages}</span>
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.min(p + 1, pageData.totalPages - 1))}
                                disabled={pageData.number >= pageData.totalPages - 1 || loading}
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}

export default CategorySelectField