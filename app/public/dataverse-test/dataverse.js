import { CONFIG } from "./config.js";
import { getToken } from "./auth.js";

export async function dvFetch(path, options = {}) {
  const token = await getToken();

  const res = await fetch(CONFIG.dataverseApi + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dataverse error: ${res.status} - ${text}`);
  }

  return res.json();
}
