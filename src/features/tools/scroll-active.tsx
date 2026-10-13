"use client";

import { useEffect } from "react";

/** Keeps the selected tool chip visible in the horizontally scrolling tool list. */
export function ScrollActive({ id }: { id: string }) {
  useEffect(() => {
    document.querySelector('nav[aria-label="Chọn công cụ"] [aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [id]);
  return null;
}
