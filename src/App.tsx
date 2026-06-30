import { BrowserRouter, Routes, Route } from "react-router-dom";

import FamilySelection from "./pages/FamilySelection";
import FamilyLayout from "./layouts/FamilyLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";


function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* Tela sem sidebar */}
        <Route 
          path="/families" 
          element={<FamilySelection />} 
        />


        {/* Tudo aqui dentro tem sidebar */}
        <Route 
          path="/family/:familyId" 
          element={<FamilyLayout />}
        >

          <Route 
            path="dashboard" 
            element={<Dashboard />} 
          />

          <Route 
            path="products" 
            element={<Products />} 
          />

          <Route 
            path="purchases" 
            element={<Purchases />} 
          />

        </Route>


      </Routes>

    </BrowserRouter>
  )
}

export default App;