import { mockTaggrClient } from "./mockTaggrClient";
import { realTaggrClient } from "./realTaggrClient";
import type { TaggrClient } from "./taggrTypes";

const apiMode = import.meta.env.VITE_TAGGR_API_MODE ?? "real";

export const taggrClient: TaggrClient =
  apiMode === "real" ? realTaggrClient : mockTaggrClient;
