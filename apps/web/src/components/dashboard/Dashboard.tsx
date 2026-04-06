import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import Navbar from "../shared/navbar/Navbar";
import { Container } from "../shared/styles/general";
import Application from "./component/Application";
import { DashboardSpotlightTour } from "./spotlight/DashboardSpotlightTour";
import { useAuthStore } from "../../store/authStore";
import { useStorageStore } from "../../store/storageStore";
import api from "../../lib/axios";
import { settingsService } from "../settings/service/settingsService";
import {
  useUserUiPreferencesStore,
  subscribeSystemTheme,
} from "../../store/userUiPreferencesStore";

const Dashboard = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    settingsService
      .getSettings()
      .then((s) => {
        if (!cancelled) useUserUiPreferencesStore.getState().hydrate(s);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    api
      .post("/files/ensure-welcome-readme")
      .then(() => {
        useStorageStore.getState().refreshStorage();
      })
      .catch(() => {});
  }, [accessToken]);

  useEffect(() => {
    return subscribeSystemTheme();
  }, []);

  return (
    <>
      <DashboardSpotlightTour />
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