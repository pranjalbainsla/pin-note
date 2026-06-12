import { apiFetch } from "./apiFetch";
import type { Pin } from "../types";

type PinsResponse = {
  status: "ok";
  pins: Pin[];
};

type PinResponse = {
  status: "ok";
  pin: Pin;
};

export async function getPins() {
  return apiFetch<PinsResponse>("/pins/getAll", {}, "Failed to fetch pins");
}

export async function createPin(url: string) {
  return apiFetch<PinResponse>("/pins/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  }, "Failed to create pin");
}
