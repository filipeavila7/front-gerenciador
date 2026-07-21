import { NavLink } from "react-router-dom";
import "../../styles/sideBar.css";

import { GrTransaction } from "react-icons/gr";
import { IoHomeOutline, IoBagHandleOutline, IoDocumentOutline } from "react-icons/io5";
import { FiShoppingBag, FiUsers } from "react-icons/fi";
import { BiCategory } from "react-icons/bi";
import { GoGraph } from "react-icons/go";
import { HiOutlineCog } from "react-icons/hi";
import { FaStar } from "react-icons/fa";
import { CiCircleList } from "react-icons/ci";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";


type Props = {
    familyId: string;
    onNavigate?: () => void;
};

function SideBar({
    familyId,
    onNavigate
}: Props) {

    const navigate = useNavigate()

    const menuItems = [
        {
            label: "Visão geral",
            icon: <IoHomeOutline className="side-icon" />,
            path: `/family/${familyId}/dashboard`,
        },
        {
            label: "Compras",
            icon: <IoBagHandleOutline className="side-icon" />,
            path: `/family/${familyId}/purchases`,
        },
        
        {
            label: "Produtos",
            icon: <FiShoppingBag className="side-icon" />,
            path: `/family/${familyId}/products`,
        },
        {
            label: "Categorias",
            icon: <BiCategory className="side-icon" />,
            path: `/family/${familyId}/category`,
        },
        {
            label: "Transações",
            icon: <GrTransaction className="side-icon" />,
            path: `/family/${familyId}/transaction`,
        },
        {
            label: "Lista compras",
            icon: <CiCircleList className="side-icon" />,
            path: `/family/${familyId}/shopping-list`,
        },
        {
            label: "Relatórios",
            icon: <IoDocumentOutline className="side-icon" />,
            path: `/family/${familyId}/history`,
        },
        {
            label: "Gráficos",
            icon: <GoGraph className="side-icon" />,
            path: `/family/${familyId}/graphics`,
        },
        {
            label: "Família",
            icon: <FiUsers className="side-icon" />,
            path: `/family/${familyId}/family`,
        },
        {
            label: "Configurações",
            icon: <HiOutlineCog className="side-icon" />,
            path: `/family/${familyId}/settings`,
        },
    ];

    return (
        <aside className="nav">
            <nav className="nav-links">

                <div className="nav-title">
                    <div className="voltar-box-2" onClick={() =>  navigate("/families")}>
                        <MdOutlineKeyboardArrowLeft className="voltar-arr" />
                    
                    </div>
                    
                    <p>
                        Ametis<span className="color2">ty</span>{" "}
                        <FaStar className="nav-title-icon" />
                    </p>
                </div>

                <ul className="menu">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? "active" : ""}`
                                }
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

            </nav>
        </aside>
    );
}

export default SideBar;
