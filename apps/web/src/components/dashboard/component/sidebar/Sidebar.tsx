import { SidebarWrapper } from "../../styles/sidebar";
import UserInfo from "./UserInfo";
import NavigationMenu from "./NavigationMenu";
import UpgradePrompt from "./UpgradePrompt";
import { useStorageStore } from "../../../../store/storageStore";
import { useEffect } from "react";
import { useAuthStore } from "../../../../store/authStore";

const Sidebar = () => {
  const usedFormatted = useStorageStore((s) => s.getUsedFormatted());
  const totalFormatted = useStorageStore((s) => s.getTotalFormatted());
  const percentage = useStorageStore((s) => s.getPercentage());

  const user = useAuthStore((s) => s.user);
  const currentDevice = useAuthStore((s) => s.currentDevice);
  const accessToken = useAuthStore((s) => s.accessToken);

  const handleUpgrade = () => {
    console.log("Upgrade clicked");
  };

  useEffect(() => {
    if (accessToken) {
      useStorageStore.getState().refreshStorage(accessToken);
      useAuthStore.getState().fetchCurrentDevice(accessToken);
    }
  }, [accessToken]);

  return (
    <SidebarWrapper>
      <UserInfo user={user} currentDevice={currentDevice} />
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
