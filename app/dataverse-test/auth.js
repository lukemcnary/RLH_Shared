import { CONFIG } from "./config.js";

const msalConfig = {
  auth: {
    clientId: CONFIG.clientId,
    authority: `https://login.microsoftonline.com/${CONFIG.tenantId}`,
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "localStorage"
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

let account = null;

export async function login() {
  const response = await msalInstance.loginPopup({
    scopes: ["openid", "profile", CONFIG.scope]
  });

  account = response.account;
  return account;
}

export async function getToken() {
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
    return res.accessToken;
  }
}