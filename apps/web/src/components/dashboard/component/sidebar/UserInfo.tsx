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
  console.log(
    "Rendering UserInfo with user:",
    user,
    "and device:",
    currentDevice,
  );

  const displayName =
    (user?.firstName && user.firstName.trim().slice(0, 10)) ||
    user.email.slice(0, 10);

  return (
    <>
      <UserName>{displayName}</UserName>
      <UserDevice>{currentDevice?.device_name || "This device"}</UserDevice>
    </>
  );
};

export default UserInfo;
