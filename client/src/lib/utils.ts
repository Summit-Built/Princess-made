import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Proxy Stripe image URLs through our server to avoid redirect latency.
 * Stripe file URLs (files.stripe.com/links/...) do a 302 redirect before serving.
 * Our proxy resolves this once and returns a 301 with long cache headers.
 */
export function proxyImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("https://files.stripe.com/")) {
    return `/api/img?src=${encodeURIComponent(url)}`;
  }
  return url;
}
