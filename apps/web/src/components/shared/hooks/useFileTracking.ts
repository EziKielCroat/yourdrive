import { useAuthStore } from "../../../store/authStore";
import axios from "axios";

export const useFileTracking = () => {
  const token = useAuthStore((s) => s.accessToken);

  const trackActivity = async (
    fileId: string | number,
    activityType:
      | "edited"
      | "viewed"
      | "downloaded"
      | "renamed"
      | "moved"
      | "shared"
      | "favorited"
      | "unfavorited",
    metadata?: object,
  ) => {
    try {
      await axios.post(
        `/api/files/activity/${fileId}`,
        { activityType, metadata },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error("Failed to track activity:", err);
    }
  };

  return { trackActivity };
};

// TODO:
// const { trackActivity } = useFileTracking();
//
// const handleSave = async () => {
//   await saveFile();
//   await trackActivity(fileId, "edited", { changes: "content updated" });
// };
