import { Outlet, useParams } from "react-router-dom";
import SideBar from "../components/layout/SideBar";


function FamilyLayout() {

  const { familyId } = useParams();


  return (
    <div className="layout">

      <SideBar familyId={familyId!}/>

      <main className="main-lay"  >
        <Outlet />
      </main>

    </div>
  );
}


export default FamilyLayout;