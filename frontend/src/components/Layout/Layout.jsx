import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

const TITLES = [
  { match: /^\/$/, title: "Dashboard" },
  { match: /^\/plans\/new$/, title: "Create Production Plan" },
  { match: /^\/plans\/[^/]+$/, title: "Production Plan" },
  { match: /^\/plans$/, title: "Production Plans" },
  { match: /^\/notifications\/[^/]+$/, title: "Notification Details" },
  { match: /^\/notifications$/, title: "Notifications" },
  { match: /^\/materials$/, title: "Materials Master" },
  { match: /^\/purchasers$/, title: "Purchasers Master" },
  { match: /^\/mapping$/, title: "Material-Purchaser Mapping" },
];

const getTitle = (pathname) => {
  const found = TITLES.find((t) => t.match.test(pathname));
  return found ? found.title : "Transformer MMS";
};

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const title = getTitle(pathname);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar title={title} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
