import { login } from "./auth.js";
import { dvFetch } from "./dataverse.js";

const btnLogin = document.getElementById("btnLogin");
const btnLoad = document.getElementById("btnLoad");
const output = document.getElementById("output");

btnLogin.onclick = async () => {
  try {
    await login();
    output.textContent = "✅ Logged in successfully";
  } catch (err) {
    output.textContent = "❌ Login failed: " + err.message;
  }
};

btnLoad.onclick = async () => {
  try {
    const data = await dvFetch(
      "cr6cd_projects?$select=cr6cd_projectname"
    );

    output.textContent = JSON.stringify(data.value, null, 2);
  } catch (err) {
    output.textContent = "❌ API failed: " + err.message;
  }
};