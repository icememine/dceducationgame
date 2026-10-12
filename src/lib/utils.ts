import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatVnd = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ` : `${Math.round(n / 1e6).toLocaleString("vi-VN")} triệu`;
