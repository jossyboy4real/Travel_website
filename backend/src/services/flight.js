import { IGNAV_API_KEY } from "../config/env.js";

const FLIGHT_SEARCH_URL = "https://ignav.com/api/fares/one-way";

export async function searchFlights(searchInfo) {
  if (!IGNAV_API_KEY) {
    throw new Error("IGNAV_API_KEY is missing from backend/.env");
  }

  const response = await fetch(FLIGHT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": IGNAV_API_KEY,
    },
    body: JSON.stringify(searchInfo),
  });

  const result = await response.json();
  if (!response.ok) {
    const providerMessage = result.message || result.error || response.statusText;
    throw new Error(`Ignav flight search failed (${response.status}): ${providerMessage}`);
  }

  return result;
}