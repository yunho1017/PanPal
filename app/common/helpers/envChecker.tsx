const IP_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

export function isProd(): boolean {
  if (isBrowser()) {
    return !!(
      (window.location.hostname &&
        window.location.hostname.includes("www.panpal.com")) ||
      (window.location.hostname &&
        window.location.hostname.includes("m.panpal.com"))
    );
  }
  return false;
}

export function isDev(): boolean {
  if (isBrowser()) {
    return !!(
      window.location.hostname &&
      (window.location.hostname.includes("localhost") ||
        IP_REGEX.test(window.location.hostname))
    );
  }
  return false;
}

export function isTest(): boolean {
  if (process.env.NODE_ENV && process.env.NODE_ENV === "test") {
    return true;
  }
  return false;
}

export function isServer(): boolean {
  return typeof window === "undefined" || typeof document === "undefined";
}

export function isServerSideRendering(): boolean {
  return isServer() && !isTest();
}

export function isBrowser(): boolean {
  return !isServer();
}

export function isSecondaryWindow(): boolean {
  return !isServer() && window.name !== "";
}
