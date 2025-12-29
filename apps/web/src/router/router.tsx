import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";

import LandingPage from "../components/landing/Landing";
import LoginPage from "../components/login/Login";
import RegisterPage from "../components/register/Register";
import Dashboard from "../components/dashboard/Dashboard";
import AboutUs from "../components/aboutus/AboutUs";
import Pricing from "../components/pricing/Pricing";

import HelpCenter from "../components/helpcenter/HelpCenter";
import HowItWorks from "../components/howitworks/HowItWorks";

import YourFiles from "../components/dashboard/component/yourFiles/YourFiles";
import SharedWithYou from "../components/dashboard/component/sharedWithYou/SharedWithYou";
import RecycleBin from "../components/dashboard/component/recycleBin/RecycleBin";
import Devices from "../components/dashboard/component/devices/Devices";
import RecentlyEdited from "../components/dashboard/component/recentlyEdited/RecentlyEdited";
import Favorited from "../components/dashboard/component/favorited/Favorited";
import Home from "../components/dashboard/component/main/Home";

export const ROUTES = {
  HOME: "/",
  ABOUTUS: "/aboutus",
  PRICING: "/pricing",
  HOWITWORKS: "/howitworks",
  HELPCENTER: "/helpcenter",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  YOUR_FILES: "/dashboard/your-files",
  SHARED_WITH_YOU: "/dashboard/shared-with-you",
  RECYCLE_BIN: "/dashboard/recycle-bin",
  DEVICES: "/dashboard/devices",
  RECENTLY_EDITED: "/dashboard/recently-edited",
  FAVORITED: "/dashboard/favorited",
} as const;

function RootComponent() {
  return <Outlet />;
}

function redirectIfAuthenticated(): void {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    throw redirect({ to: ROUTES.YOUR_FILES });
  }
}

async function requireAuthentication(): Promise<void> {
  const { isAuthenticated, checkAuth } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: ROUTES.LOGIN });
  }
  try {
    await checkAuth();
  } catch {
    throw redirect({ to: ROUTES.LOGIN });
  }
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: redirectIfAuthenticated,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
  beforeLoad: redirectIfAuthenticated,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
  beforeLoad: requireAuthentication,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: Home,
});

const aboutUsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/aboutus",
  component: AboutUs,
});

const howItWorksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/howitworks",
  component: HowItWorks,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pricing",
  component: Pricing,
});

const helpCenterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/helpcenter",
  component: HelpCenter,
});

const yourFilesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/your-files",
  component: YourFiles,
});

const sharedWithYouRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/shared-with-you",
  component: SharedWithYou,
});

const recycleBinRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/recycle-bin",
  component: RecycleBin,
});

const devicesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/devices",
  component: Devices,
});

const recentlyEditedRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/recently-edited",
  component: RecentlyEdited,
});

const favoritedRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/favorited",
  component: Favorited,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  aboutUsRoute,
  howItWorksRoute,
  pricingRoute,
  helpCenterRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    yourFilesRoute,
    sharedWithYouRoute,
    recycleBinRoute,
    devicesRoute,
    recentlyEditedRoute,
    favoritedRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
