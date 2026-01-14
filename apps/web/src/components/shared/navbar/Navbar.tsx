import React from "react";
import { LeftSection, RightSection, NavbarContainer } from "./styles/navbar";

import Image from "../image/Image";
import NavButton from "./components/NavButton";

import PlusIcon from "../icons/plus";
import NotificationCenterIcon from "../icons/notificationCenter";
import SettingsIcon from "../icons/settings";
import LogOutIcon from "../icons/logout";
import { usePopupStore } from "../popups/popup.store";
import UploadPopup from "../popups/upload/UploadPopup";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../router/router";
import NotificationPopup from "../popups/notification/NotificationPopup";

const Navbar = () => {
  const uploadRef = React.useRef<HTMLButtonElement>(null);
  const notificationRef = React.useRef<HTMLButtonElement>(null);

  const activateUploadPopup = usePopupStore((state) => state.toggleUploadPopup);
  const activateNotificationPopup = usePopupStore(
    (state) => state.toggleNotificationPopup
  );

  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  return (
    <NavbarContainer>
      <UploadPopup anchorRef={uploadRef} />
      <NotificationPopup anchorRef={notificationRef} />

      <LeftSection>
        <Image src="/logo.svg" alt="Logo" width={135} height={90} />
        <NavButton ref={uploadRef} onClick={activateUploadPopup}>
          <PlusIcon />
        </NavButton>
      </LeftSection>

      <RightSection>
        <NavButton ref={notificationRef} onClick={activateNotificationPopup}>
          <NotificationCenterIcon />
        </NavButton>
        <NavButton onClick={() => navigate({ to: ROUTES.SETTINGS })}>
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
