import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MaterialsMaster from "./pages/MaterialsMaster.jsx";
import PurchasersMaster from "./pages/PurchasersMaster.jsx";
import MaterialPurchaserMapping from "./pages/MaterialPurchaserMapping.jsx";
import ProductionPlans from "./pages/ProductionPlans.jsx";
import CreateProductionPlan from "./pages/CreateProductionPlan.jsx";
import PlanDetails from "./pages/PlanDetails.jsx";
import Notifications from "./pages/Notifications.jsx";
import NotificationDetails from "./pages/NotificationDetails.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plans" element={<ProductionPlans />} />
        <Route path="/plans/new" element={<CreateProductionPlan />} />
        <Route path="/plans/:id" element={<PlanDetails />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notifications/:id" element={<NotificationDetails />} />
        <Route path="/materials" element={<MaterialsMaster />} />
        <Route path="/purchasers" element={<PurchasersMaster />} />
        <Route path="/mapping" element={<MaterialPurchaserMapping />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
