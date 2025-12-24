"use client";

const API_BASE = "http://localhost:5001/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions {
  headers?: HeadersInit;
  credentials?: RequestCredentials;
}

/**
 * Generic API handler using fetch
 * T = expected response type
 */
const apiHandling = async <T = unknown>(
  endpoint: string,
  method: HttpMethod = "GET",
  data?: unknown,
  options: ApiOptions = {}
): Promise<T> => {
  let url = `${API_BASE}${endpoint}`;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: options.credentials ?? "include",
  };

  // Attach data
  if (data) {
    if (method === "GET") {
      const params = new URLSearchParams(data as Record<string, string>); //apiHandling("/search", "GET", { q: "hello" }); becomes /api/search?q=hello
      url += `?${params.toString()}`;
    } else {
      fetchOptions.body = JSON.stringify(data);
    }
  }

  try {
    console.log(`Making ${method} request to ${url}`);

    const response = await fetch(url, fetchOptions);

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage =
          errorData?.error ||
          errorData?.message ||
          errorMessage;
      } catch {
        // ignore JSON parse errors
      }

      if (response.status === 401) {
        console.error("Unauthorized - redirect to login");
      }

      if (response.status >= 500) {
        console.error("Server error occurred");
      }

      throw new Error(errorMessage);
    }

    // Handle empty responses (204, etc.)
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unknown error occurred");
  }
};

export default apiHandling;
