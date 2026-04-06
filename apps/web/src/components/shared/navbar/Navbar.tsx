import React from "react";
import {
  RightSection,
  NavbarContainer,
  LeftSectionWithMobile,
} from "./styles/navbar";

import Image from "../image/Image";
import NavButton from "./components/NavButton";

import PlusIcon from "../icons/plus";
import SettingsIcon from "../icons/settings";
import LogOutIcon from "../icons/logout";
import { usePopupStore } from "../popups/popup.store";
import UploadPopup from "../popups/upload/UploadPopup";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../router/router";
import NotificationPopup from "../popups/notification/NotificationPopup";

const Navbar = () => {
  const uploadRefDesktop = React.useRef<HTMLButtonElement>(null);
  const uploadRefMobile = React.useRef<HTMLButtonElement>(null);
  const notificationRef = React.useRef<HTMLButtonElement>(null);

  const activateUploadPopup = usePopupStore((state) => state.toggleUploadPopup);

  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  return (
    <NavbarContainer>
      <UploadPopup
        anchorRefDesktop={uploadRefDesktop}
        anchorRefMobile={uploadRefMobile}
      />
      <NotificationPopup anchorRef={notificationRef} />

      <LeftSectionWithMobile>
        <Image src="/logo.svg" alt="Logo" width={135} height={90} />
        <NavButton
          ref={uploadRefDesktop}
          onClick={activateUploadPopup}
          className="desktop-only"
          data-tour="tour-upload"
        >
          <PlusIcon />
        </NavButton>
      </LeftSectionWithMobile>

      <RightSection>
        <NavButton
          ref={uploadRefMobile}
          onClick={activateUploadPopup}
          className="mobile-only"
          data-tour="tour-upload"
        >
          <PlusIcon />
        </NavButton>
        <NavButton
          onClick={() => navigate({ to: ROUTES.SETTINGS })}
          data-tour="tour-settings"
        >
          <SettingsIcon />
        </NavButton>
        <NavButton onClick={logout}>
          <LogOutIcon />
        </NavButton>
      </RightSection>
    </NavbarContainer>
  );
};

export default Navbar;
