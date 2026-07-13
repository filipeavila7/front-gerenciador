import { useState, useEffect, useRef } from "react";
import api from "../../service/api";
import type { PageResponse } from "../../types/pagination/PageResponse";
import type { CategoryResponse } from "../../types/category/CategoryResponse";
import { getErrorMessage } from "../utils/GetErrorMessage";
import { FaChevronDown, FaSearch, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

interface Props {
    familyId: string;
    selectedCategoryId: number | null;
    selectedCategoryName: string | null;
    onSelect: (categoryId: number | null, categoryName: string | null) => void;
}

const CATEGORY_PAGE_SIZE = 12;
const DEBOUNCE_MS = 400;

function CategoryFilterDropdown({ familyId, selectedCategoryId, selectedCategoryName, onSelect }: Props) {

    const [open, setOpen] = useState(false);
    const [pageData, setPageData] = useState<PageResponse<CategoryResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    // fecha ao clicar fora
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

    // debounce da digitação
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(0);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (!open || !familyId) return;

        let ignore = false;

        async function loadCategories() {
            setLoading(true);

            try {
                const res = await api.get<PageResponse<CategoryResponse>>(
                    `/category/my/family/${familyId}/search`,
                    { params: { name: debouncedSearch, page, size: CATEGORY_PAGE_SIZE } }
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
    }, [open, familyId, debouncedSearch, page]);

    const categories = pageData?.content ?? [];

    function handleSelect(category: CategoryResponse) {
        onSelect(category.id, category.name);
        setOpen(false);
    }

    function handleClear() {
        onSelect(null, null);
        setOpen(false);
    }

    return (
        <div className="category-select-wrapper" ref={wrapperRef}>
            <button
                type="button"
                className="filter-dropdown-trigger"
                onClick={() => setOpen(prev => !prev)}
            >
                <span className={selectedCategoryId ? "" : "category-select-placeholder"}>
                    {selectedCategoryName ?? "Todas as categorias"}
                </span>

                {selectedCategoryId && (
                    <span
                        className="filter-clear-icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                    >
                        <FaTimes />
                    </span>
                )}

                <FaChevronDown className={`category-select-chevron ${open ? "chevron-open" : ""}`} />
            </button>

            {open && (
                <div className="category-select-dropdown">

                    <div className="modal-search category-select-search">
                        <FaSearch className="modal-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar categoria..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="category-select-list">

                        <button
                            type="button"
                            className={`modal-product-row ${!selectedCategoryId ? "category-option-selected" : ""}`}
                            onClick={handleClear}
                        >
                            <span>Todas as categorias</span>
                        </button>

                        {loading && !pageData ? (
                            <div className="modal-empty"><p>Carregando...</p></div>
                        ) : categories.length === 0 ? (
                            <div className="modal-empty"><p>Nenhuma categoria encontrada.</p></div>
                        ) : (
                            categories.map(category => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={`modal-product-row ${category.id === selectedCategoryId ? "category-option-selected" : ""}`}
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

export default CategoryFilterDropdown