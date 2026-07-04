import { Link } from "react-router-dom";


function SideBar({ familyId }: { familyId: string }) {
    return (
        <aside>

            <nav className="nav-links">
                <li>
                    <ul>
                        <Link to={`/family/${familyId}/dashboard`}>
                            Dashboard
                        </Link>
                    </ul>

                    <ul>
                        <Link to={`/family/${familyId}/products`}>
                            Produtos
                        </Link>

                    </ul>

                    <ul>
                        <Link to={`/family/${familyId}/purchases`}>
                            Compras
                        </Link>
                    </ul>


                    <ul></ul>
                    <ul></ul>
                </li>
            </nav>

        </aside>
    )
}

export default SideBar