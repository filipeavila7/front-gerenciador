import { FaChevronDown, FaPlus, FaRegCalendarAlt, FaSearch } from "react-icons/fa"
import "../styles/product.css"

function Products() {


  
  return (
    <div className="product-lay">
      <div className="product-header">
        <div className="product-title-box">
          <h1>
            Produtos
          </h1>
          <p>Seus produtos reutilizáveis nas suas compras.</p>
        </div>

        <div className="product-header-actions">
          <div className="product-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              
            />
          </div>

          <button
            className="new-product-btn"
           
          >
            <FaPlus /> Novo produto
          </button>
        </div>
      </div>

      <div className="product-toolbar">
        <div className="product-tabs">
          <button
            className={`tab-btn`}
           
          >
            Todas
          </button>

          <button
            className={`tab-btn`}
           
          >
            Este mês
          </button>



          <button
            className={`tab-btn`}

          >
            Pendentes
          </button>
        </div>

        <div className="product-sort">
          <button className="sort-btn">
            Mais recentes <FaChevronDown />
          </button>
          <button className="calendar-btn">
            <FaRegCalendarAlt />
          </button>
        </div>
      </div>
      </div>

      )
}

      export default Products