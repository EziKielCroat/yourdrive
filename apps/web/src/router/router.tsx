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
import Settings from "../components/settings/Settings";
import Features from "../components/features/Features";
import TermsOfService from "../components/termsofservice/TermsOfService";
import PrivacyPolicy from "../components/privacypolicy/PrivacyPolicy";

import PersonalStorage from "../components/personalstorage/PersonalStorage";
import FileSharingEditing from "../components/filesharingediting/FileSharingEditing";
import SecureStorage from "../components/securestorage/SecureStorage";
import TeamCollaboration from "../components/teamcollaboration/TeamCollaboration";

export const ROUTES = {
  HOME: "/",
  ABOUTUS: "/aboutus",
  PRICING: "/pricing",
  HOWITWORKS: "/howitworks",
  HELPCENTER: "/helpcenter",
  FEATURES: "/features",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  PERSONAL_STORAGE: "/personal",
  FILE_SHARING_EDITING: "/file-editing",
  SECURE_STORAGE: "/secure",
  TEAM_COLLABORATION: "/team",
  YOUR_FILES: "/dashboard/your-files",
  SHARED_WITH_YOU: "/dashboard/shared-with-you",
  RECYCLE_BIN: "/dashboard/recycle-bin",
  DEVICES: "/dashboard/devices",
  RECENTLY_EDITED: "/dashboard/recently-edited",
  FAVORITED: "/dashboard/favorited",
  SETTINGS: "/dashboard/settings",
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

const personalStorageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/personal",
  component: PersonalStorage,
});

const fileSharingEditingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/file-editing",
  component: FileSharingEditing,
});

const secureStorageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/secure",
  component: SecureStorage,
});

const teamCollaborationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/team",
  component: TeamCollaboration,
});

const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPolicy,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsOfService,
});

const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/features",
  component: Features,
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

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/settings",
  component: Settings,
  beforeLoad: requireAuthentication,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  aboutUsRoute,
  howItWorksRoute,
  pricingRoute,
  privacyPolicyRoute,
  termsRoute,
  personalStorageRoute,
  fileSharingEditingRoute,
  secureStorageRoute,
  teamCollaborationRoute,
  featuresRoute,
  helpCenterRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    yourFilesRoute,
    sharedWithYouRoute,
    recycleBinRoute,
    devicesRoute,
    recentlyEditedRoute,
    favoritedRoute,
    settingsRoute,
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
