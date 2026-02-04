import { Outlet, useLocation } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import Navbar from "../shared/navbar/Navbar";
import { Container } from "../shared/styles/general";
import Application from "./component/Application";

const Dashboard = () => {
  const location = useLocation();

  return (
    <Container>
      <Navbar />
      <Application>
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </Application>
    </Container>
  );
};

export default Dashboard;
