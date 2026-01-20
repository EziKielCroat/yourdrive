import { toast } from "react-hot-toast";
import { useAuthStore } from "../../../store/authStore";
import axios from "axios";

interface ActionOptions {
  fileIds: string[];
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

export const useFileActions = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  const performFileAction = async (
    action: "delete" | "deletePermanently" | "restore",
    options: ActionOptions,
  ) => {
    const { fileIds, onSuccess, onError } = options;
    if (!fileIds || fileIds.length === 0) return;

    try {
      await Promise.all(
        fileIds.map(async (fileId) => {
          let url = "";
          let method: "post" | "delete" = "post";

          switch (action) {
            case "delete":
              url = `/api/files/delete/${fileId}`;
              method = "post";
              break;
            case "deletePermanently":
              url = `/api/files/recycle-bin/delete/${fileId}`;
              method = "delete";
              break;
            case "restore":
              url = `/api/files/recycle-bin/restore/${fileId}`;
              method = "post";
              break;
          }

          const response = await axios({
            method,
            url,
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!response.data.success) {
            throw new Error(response.data.error || "Unknown error");
          }

          return response.data;
        }),
      );

      toast.success(
        action === "delete"
          ? "Moved to Recycle Bin"
          : action === "deletePermanently"
            ? "Deleted permanently"
            : "File restored",
      );
      onSuccess?.();
    } catch (err: any) {
      console.error("File action error:", err);
      toast.error(err?.response?.data?.error || "Action failed");
      onError?.(err);
    }
  };

  return { performFileAction };
};
