import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout/Layout.jsx";

// Wraps protected pages: redirects to /login if not authenticated,
// otherwise renders the shared shell (sidebar + navbar) around the page.
const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PrivateRoute;
