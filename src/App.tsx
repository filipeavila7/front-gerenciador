import { BrowserRouter, Routes, Route } from "react-router-dom";

import FamilySelection from "./pages/FamilySelection";
import FamilyLayout from "./layouts/FamilyLayout";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Login from "./pages/Login";
import PurchaseItens from "./pages/PurchaseItens";
import Category from "./pages/Category";
import { ToastProvider } from "./context/ToastContext";
import Transaction from "./pages/Transaction";
import TransactionDetails from "./pages/TransactionDetails";
import ShoppingList from "./pages/ShoppingList";
import ShoppingListItems from "./pages/ShoppingListItems";
import Graphics from "./pages/Graphics";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Tela sem sidebar */}
          <Route
            path="/families"
            element={<FamilySelection />}
          />

          <Route
            path="/"
            element={<Login />}
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
              path="history"
              element={<History />}
            />

            <Route
              path="category"
              element={<Category />}
            />

            <Route
              path="purchases"
              element={<Purchases />}
            />

            <Route
              path="graphics"
              element={<Graphics />}
            />

            <Route
              path="transaction"
              element={<Transaction />}
            />

            <Route
              path="shopping-list"
              element={<ShoppingList />}
            />
            
            <Route
              path="shopping-list/:shoppingListId"
              element={<ShoppingListItems />}
            />

            <Route
              path="purchases/:purchaseId"
              element={<PurchaseItens />}
            />

            <Route
              path="transaction/:transactionId"
              element={<TransactionDetails />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;