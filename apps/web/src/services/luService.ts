export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type StreamHandlers = {
  onChunk: (delta: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
};

/** Optional caps for OpenAI-compatible `/v1/chat/completions` (Ollama, Groq, etc.) */
export type StreamChatOptions = {
  maxTokens?: number;
  temperature?: number;
};

function getConfig() {
  const maxRaw = import.meta.env.VITE_LU_MAX_TOKENS;
  const tempRaw = import.meta.env.VITE_LU_TEMPERATURE;
  return {
    apiUrl: (import.meta.env.VITE_LU_API_URL ?? "").replace(/\/$/, ""),
    model: import.meta.env.VITE_LU_MODEL ?? "phi3:mini",
    apiKey: import.meta.env.VITE_LU_API_KEY ?? "",
    defaultMaxTokens: maxRaw != null && String(maxRaw) !== "" ? parseInt(String(maxRaw), 10) : 800,
    defaultTemperature: tempRaw != null && String(tempRaw) !== "" ? parseFloat(String(tempRaw)) : 0.45,
  };
}

export function streamChat(
  messages: ChatMessage[],
  { onChunk, onDone, onError }: StreamHandlers,
  options?: StreamChatOptions,
): AbortController {
  const controller = new AbortController();
  const { apiUrl, model, apiKey, defaultMaxTokens, defaultTemperature } = getConfig();
  const maxTokens = options?.maxTokens ?? (Number.isFinite(defaultMaxTokens) ? defaultMaxTokens : 800);
  const temperature = options?.temperature ?? (Number.isFinite(defaultTemperature) ? defaultTemperature : 0.45);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  (async () => {
    let res: Response;
    try {
      res = await fetch(`${apiUrl}/v1/chat/completions`, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: Number.isFinite(temperature) ? temperature : 0.45,
          max_tokens: Number.isFinite(maxTokens) && maxTokens > 0 ? maxTokens : 800,
        }),
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      onError(
        err instanceof Error
          ? `Connection failed: ${err.message}`
          : "Connection failed",
      );
      return;
    }

    if (!res.ok) {
      let detail = "";
      try {
        detail = await res.text();
      } catch {
        /* ignore */
      }
      onError(`API error ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError("No response body from server.");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta) onChunk(delta);
          } catch {
            // skip malformed SSE line
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      onError(err instanceof Error ? err.message : "Stream read error");
      return;
    } finally {
      reader.releaseLock();
    }

    onDone();
  })();

  return controller;
}

export function getBackendLabel(): string {
  const url = (import.meta.env.VITE_LU_API_URL ?? "").toLowerCase();
  if (url.includes("groq.com")) return "Groq";
  if (url.includes("openai.com")) return "OpenAI";
  if (url.includes("localhost") || url.includes("127.0.0.1") || url === "") return "Local AI";
  return "Local AI";
}
