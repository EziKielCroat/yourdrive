import { Outlet } from "@tanstack/react-router";
import Navbar from "../shared/navbar/Navbar";
import { Container } from "../shared/styles/general";
import Application from "./component/Application";

const Dashboard = () => {
  return (
    <>
    <Container>
      <Navbar />
      <Application>
        <Outlet />
      </Application>
    </Container>
    </>
  );
};

export default Dashboard;