import { SidebarWrapper } from "../../styles/sidebar";
import UserInfo from "./UserInfo";
import NavigationMenu from "./NavigationMenu";
import UpgradePrompt from "./UpgradePrompt";

import { useStorageStore } from "../../../../store/storageStore";
import { useEffect } from "react";
import { useAuthStore } from "../../../../store/authStore";
import { useSidebarStore } from "../../../../store/sidebarStore";

const Sidebar = () => {
  const usedFormatted = useStorageStore((s) => s.getUsedFormatted());
  const totalFormatted = useStorageStore((s) => s.getTotalFormatted());
  const percentage = useStorageStore((s) => s.getPercentage());

  const user = useAuthStore((s) => s.user);
  const currentDevice = useAuthStore((s) => s.currentDevice);
  const accessToken = useAuthStore((s) => s.accessToken);

  const isOpen = useSidebarStore((s) => s.isOpen);

  const handleUpgrade = () => {
    console.log("Upgrade clicked");
  };

  useEffect(() => {
    if (accessToken) {
      useStorageStore.getState().refreshStorage();
      useAuthStore.getState().fetchCurrentDevice();
    }
  }, [accessToken]);

  return (
    <SidebarWrapper $isOpen={isOpen}>
      {/* <SidebarToggle /> */}
      {user && (
        <UserInfo
          user={{ ...user, createdAt: typeof user.createdAt === "string" ? new Date(user.createdAt) : user.createdAt }}
          currentDevice={currentDevice ? { device_name: currentDevice.device_name } : { device_name: null }}
        />
      )}
      <NavigationMenu />
      <UpgradePrompt
        used={usedFormatted}
        total={totalFormatted}
        percentage={percentage}
        onUpgrade={handleUpgrade}
      />
    </SidebarWrapper>
  );
};

export default Sidebar;
