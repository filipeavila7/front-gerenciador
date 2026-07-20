import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Outlet, useParams } from "react-router-dom";
import SideBar from "../components/layout/SideBar";


function FamilyLayout() {

  const { familyId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  return (
    <div className={`layout ${isSidebarOpen ? "sidebar-open" : ""}`}>

      <button
        className="mobile-menu-btn"
        type="button"
        onClick={() => setIsSidebarOpen((open) => !open)}
        aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isSidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {isSidebarOpen && (
        <button
          className="mobile-nav-backdrop"
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <SideBar
        familyId={familyId!}
        onNavigate={() => setIsSidebarOpen(false)}
      />

      <main className="main-lay"  >
        <Outlet />
      </main>

    </div>
  );
}


export default FamilyLayout;
