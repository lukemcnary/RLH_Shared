import { CONFIG } from "./config.js";

function getMsal() {
  const msalGlobal = window.msal;
  if (!msalGlobal || typeof msalGlobal.PublicClientApplication !== "function") {
    throw new Error("MSAL did not load. Open this page through the Next app, not as a raw file.");
  }
  return msalGlobal;
}

const msalConfig = {
  auth: {
    clientId: CONFIG.clientId,
    authority: `https://login.microsoftonline.com/${CONFIG.tenantId}`,
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  }
};

const msalInstance = new (getMsal().PublicClientApplication)(msalConfig);
let account = msalInstance.getAllAccounts()[0] ?? null;

export function getAccount() {
  return account;
}

export async function login() {
  const response = await msalInstance.loginPopup({
    scopes: ["openid", "profile", CONFIG.scope]
  });

  account = response.account;
  if (account) {
    msalInstance.setActiveAccount(account);
  }
  return account;
}

export async function getToken() {
  account = account ?? msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0] ?? null;
  if (!account) throw new Error("Not logged in");

  const request = {
    scopes: [CONFIG.scope],
    account
  };

  try {
    const res = await msalInstance.acquireTokenSilent(request);
    return res.accessToken;
  } catch {
    const res = await msalInstance.acquireTokenPopup(request);
    account = res.account ?? account;
    if (account) {
      msalInstance.setActiveAccount(account);
    }
    return res.accessToken;
  }
}
