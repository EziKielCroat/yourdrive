import { UserName, UserDevice } from "../../styles/sidebar";

interface UserInfoProps {
  user: {
    firstName: string | null;
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
  };
  currentDevice: {
    device_name: string | null;
  };
}

const UserInfo = ({ user, currentDevice }: UserInfoProps) => {
  return (
    <>
      <UserName>{user?.firstName || ""}</UserName>
      <UserDevice>{currentDevice?.device_name || "Unknown Device"}</UserDevice>
    </>
  );
};

export default UserInfo;
