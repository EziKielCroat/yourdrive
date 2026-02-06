import api from "../../../lib/axios";

export const useFileTracking = () => {
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
      await api.post(`/files/activity/${fileId}`, { activityType, metadata });
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
