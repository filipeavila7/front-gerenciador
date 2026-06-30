import { Outlet, useParams } from "react-router-dom";
import SideBar from "../components/SideBar";


function FamilyLayout() {

  const { familyId } = useParams();


  return (
    <div>

      <SideBar familyId={familyId!}/>

      <main>
        <Outlet />
      </main>

    </div>
  );
}


export default FamilyLayout;