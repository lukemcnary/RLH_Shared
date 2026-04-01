import { getAccount, login } from "./auth.js";
import { dvFetch } from "./dataverse.js";

const btnLogin = document.getElementById("btnLogin");
const btnLoad = document.getElementById("btnLoad");
const output = document.getElementById("output");
const grouped = document.getElementById("grouped");
const status = document.getElementById("status");
const callout = document.getElementById("callout");
const DAY_WIDTH = 40;
let currentGroupedWithOffsets = null;

function setStatus(text) {
  status.textContent = text;
}

function setCallout(text) {
  if (!text) {
    callout.textContent = "";
    callout.classList.remove("visible");
    return;
  }

  callout.textContent = text;
  callout.classList.add("visible");
}

function syncAuthState() {
  const account = getAccount();
  if (account) {
    btnLogin.textContent = "Re-authenticate";
    setStatus(`Signed in as ${account.username || account.name || "unknown user"}`);
  } else {
    btnLogin.textContent = "Login";
    setStatus("Waiting for sign-in");
  }
}

function getProjectTradeId(trade) {
  return (
    trade?.rlh_projecttradeid ||
    trade?.cr6cd_projecttradeid ||
    trade?.id ||
    ""
  );
}

function getMobilizationTradeId(mobilization) {
  return (
    mobilization?._cr6cd_projecttrade_value ||
    mobilization?._rlh_projecttrade_value ||
    mobilization?.projectTradeId ||
    ""
  );
}

function getTradeName(trade) {
  return (
    trade?.rlh_newcolumn ||
    trade?.cr6cd_name ||
    trade?.name ||
    trade?.rlh_externalid ||
    trade?.rlh_projecttradeid ||
    "Unnamed Trade"
  );
}

function getMobilizationLabel(mobilization) {
  return (
    mobilization?.cr6cd_newcolumn ||
    mobilization?.cr6cd_why ||
    `Mobilization ${mobilization?.cr6cd_mobilizationid || ""}`.trim()
  );
}

function getScopeMobilizationId(scope) {
  return (
    scope?._rlh_mobilization_value ||
    scope?._cr6cd_mobilizationid_value ||
    scope?.mobilizationId ||
    ""
  );
}

function getScopeLabel(scope) {
  return (
    scope?.rlh_newcolumn ||
    scope?.cr6cd_name ||
    scope?.name ||
    scope?.rlh_externalid ||
    scope?.rlh_tradescopeid ||
    "Unnamed Scope"
  );
}

function getScopeId(scope) {
  return (
    scope?.rlh_tradescopeid ||
    scope?.rlh_externalid ||
    scope?.id ||
    ""
  );
}

function getScopeDuration(scope) {
  const raw =
    scope?.cr6cd_duration ??
    scope?.rlh_duration ??
    scope?.duration ??
    1;

  const duration = Number(raw);
  return Number.isFinite(duration) && duration > 0 ? duration : 1;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function groupMobilizationsByTrade(data) {
  const result = {};

  data.projectTrades.forEach((trade) => {
    const tradeId = getProjectTradeId(trade);
    if (!tradeId) return;

    result[tradeId] = {
      trade,
      mobilizations: [],
    };
  });

  data.mobilizations.forEach((mobilization) => {
    const tradeId = getMobilizationTradeId(mobilization);
    if (result[tradeId]) {
      result[tradeId].mobilizations.push(mobilization);
    }
  });

  return result;
}

function attachScopesToMobilizations(groupedData, data) {
  data.scopes.forEach((scope) => {
    const mobilizationId = getScopeMobilizationId(scope);
    if (!mobilizationId) return;

    Object.values(groupedData).forEach((group) => {
      group.mobilizations.forEach((mobilization) => {
        if (mobilization?.cr6cd_mobilizationid !== mobilizationId) return;

        if (!Array.isArray(mobilization.scopes)) {
          mobilization.scopes = [];
        }

        mobilization.scopes.push(scope);
      });
    });
  });

  return groupedData;
}

function buildStepsForMobilizations(groupedData) {
  Object.values(groupedData).forEach((group) => {
    group.mobilizations.forEach((mobilization) => {
      const scopes = Array.isArray(mobilization.scopes) ? mobilization.scopes : [];
      if (mobilization.offset === undefined) {
        mobilization.offset = 0;
      }

      let currentDay = mobilization.offset || 0;

      mobilization.steps = scopes.map((scope, index) => {
        const duration = getScopeDuration(scope);
        const step = {
          id: getScopeId(scope) || `${mobilization.cr6cd_mobilizationid || "mobilization"}-step-${index + 1}`,
          name: getScopeLabel(scope),
          order: index + 1,
          duration,
          startDay: currentDay,
          endDay: currentDay + duration,
        };

        currentDay += duration;
        return step;
      });

      mobilization.totalDuration = mobilization.steps.reduce(
        (sum, step) => sum + (step.duration || 0),
        0
      );
    });
  });

  return groupedData;
}

function getTimelineSpan(mobilization) {
  if (!Array.isArray(mobilization?.steps) || mobilization.steps.length === 0) {
    return Math.max(Number(mobilization?.offset || 0), 1);
  }

  const maxEndDay = mobilization.steps.reduce(
    (latestEnd, step) => Math.max(latestEnd, Number(step?.endDay || 0)),
    0
  );

  return Math.max(maxEndDay, 1);
}

function shiftMobilization(groupedData, tradeId, mobilizationId, amount) {
  const group = groupedData?.[tradeId];
  if (!group) return groupedData;

  const mobilization = group.mobilizations.find(
    (candidate) => candidate?.cr6cd_mobilizationid === mobilizationId
  );
  if (!mobilization) return groupedData;

  mobilization.offset = Math.max(0, (mobilization.offset || 0) + amount);
  return buildStepsForMobilizations(groupedData);
}

function renderGroupedMobilizations(groupedData) {
  const groups = Object.values(groupedData);

  if (groups.length === 0) {
    grouped.innerHTML = `
      <h2>Trades → Mobilizations → Movable Timeline Bars</h2>
      <p class="grouped-empty">No project trades were returned, so nothing could be grouped yet.</p>
    `;
    return;
  }

  const groupMarkup = groups.map((group) => {
    const mobilizationMarkup =
      group.mobilizations.length > 0
        ? group.mobilizations
            .map((mobilization) => {
              const timelineSpan = getTimelineSpan(mobilization);
              const timelineWidth = Math.max(timelineSpan * DAY_WIDTH, DAY_WIDTH);

              return `
                <li>
                  <strong>${escapeHtml(getMobilizationLabel(mobilization))} - ${escapeHtml(String(mobilization.totalDuration || 0))} days</strong>
                  <div class="mobilization-controls">
                    <button
                      class="timeline-shift"
                      type="button"
                      data-shift-trade="${escapeHtml(getProjectTradeId(group.trade))}"
                      data-shift-mob="${escapeHtml(mobilization.cr6cd_mobilizationid || "")}"
                      data-shift-amount="-1"
                    >
                      ◀
                    </button>
                    <button
                      class="timeline-shift"
                      type="button"
                      data-shift-trade="${escapeHtml(getProjectTradeId(group.trade))}"
                      data-shift-mob="${escapeHtml(mobilization.cr6cd_mobilizationid || "")}"
                      data-shift-amount="1"
                    >
                      ▶
                    </button>
                    <span>Offset: ${escapeHtml(String(mobilization.offset || 0))}</span>
                  </div>
                  ${
                    Array.isArray(mobilization.steps) && mobilization.steps.length > 0
                      ? `
                        <div class="timeline-shell">
                          <div class="timeline-grid" style="width: ${timelineWidth}px;">
                            ${Array.from({ length: timelineSpan })
                              .map(
                                (_, index) => `
                                  <div class="timeline-grid-cell" style="width: ${DAY_WIDTH}px;">${index}</div>
                                `
                              )
                              .join("")}
                          </div>
                          <div class="timeline-track" style="width: ${timelineWidth}px;">
                            ${mobilization.steps
                              .map(
                                (step) => `
                                  <div
                                    class="timeline-bar"
                                    style="left: ${step.startDay * DAY_WIDTH}px; width: ${Math.max(step.duration * DAY_WIDTH, 36)}px;"
                                    title="${escapeHtml(`${step.name}: Day ${step.startDay} → ${step.endDay}`)}"
                                  >
                                    ${escapeHtml(step.name)}
                                  </div>
                                `
                              )
                              .join("")}
                          </div>
                        </div>
                      `
                      : ""
                  }
                  <ul>
                    ${
                      Array.isArray(mobilization.steps) && mobilization.steps.length > 0
                        ? mobilization.steps
                            .map(
                              (step) =>
                                `<li>${escapeHtml(String(step.order))}. ${escapeHtml(step.name)} - Day ${escapeHtml(String(step.startDay))} → ${escapeHtml(String(step.endDay))}</li>`
                            )
                            .join("")
                        : "<li>No derived steps yet</li>"
                    }
                  </ul>
                </li>
              `;
            })
            .join("")
        : "<li>No mobilizations linked yet</li>";

    return `
      <div class="trade-group">
        <h3>${escapeHtml(getTradeName(group.trade))}</h3>
        <ul>${mobilizationMarkup}</ul>
      </div>
    `;
  });

  grouped.innerHTML = `
    <h2>Trades → Mobilizations → Movable Timeline Bars</h2>
    ${groupMarkup.join("")}
  `;

  grouped.querySelectorAll("[data-shift-mob]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!currentGroupedWithOffsets) return;

      const tradeId = button.getAttribute("data-shift-trade") || "";
      const mobilizationId = button.getAttribute("data-shift-mob") || "";
      const amount = Number(button.getAttribute("data-shift-amount") || "0");

      currentGroupedWithOffsets = shiftMobilization(
        currentGroupedWithOffsets,
        tradeId,
        mobilizationId,
        amount
      );

      console.log("WITH OFFSET:", currentGroupedWithOffsets);
      renderGroupedMobilizations(currentGroupedWithOffsets);
    });
  });
}

if (window.location.protocol === "file:") {
  setCallout("This test page must be served over HTTP. Open it through the app at http://localhost:3000/dataverse-test instead of double-clicking the file.");
}

syncAuthState();

btnLogin.onclick = async () => {
  try {
    setCallout("");
    setStatus("Opening Microsoft sign-in...");
    await login();
    syncAuthState();
    output.textContent = "✅ Logged in successfully";
  } catch (err) {
    setStatus("Login failed");
    output.textContent = "❌ Login failed: " + err.message;
  }
};

btnLoad.onclick = async () => {
  try {
    setCallout("");
    setStatus("Loading core Dataverse tables...");

    const [projectsData, mobilizationsData, scopesData, projectTradesData] = await Promise.all([
      dvFetch("cr6cd_projects?$select=cr6cd_projectname&$top=20"),
      dvFetch(
        "cr6cd_mobilizations?$select=cr6cd_mobilizationid,cr6cd_why,cr6cd_startoffset,cr6cd_durationdays,_cr6cd_project_value,_cr6cd_projecttrade_value,_cr6cd_buildphase_value&$top=20"
      ),
      dvFetch(
        "rlh_tradescopes?$select=rlh_tradescopeid,rlh_newcolumn,rlh_externalid,rlh_notes,rlh_displayorder,_rlh_projecttrade_value,_rlh_partnerlookup_value,_rlh_mobilization_value&$top=20"
      ),
      dvFetch(
        "rlh_projecttrades?$select=rlh_externalid,rlh_projecttradeid,_rlh_trade_value,rlh_newcolumn,rlh_scopesummary,rlh_notes,_cr720_partnerlookup_value&$top=20"
      ),
    ]);

    const projects = Array.isArray(projectsData.value) ? projectsData.value : [];
    const mobilizations = Array.isArray(mobilizationsData.value) ? mobilizationsData.value : [];
    const scopes = Array.isArray(scopesData.value) ? scopesData.value : [];
    const projectTrades = Array.isArray(projectTradesData.value) ? projectTradesData.value : [];
    const groupedByTrade = groupMobilizationsByTrade({
      projects,
      projectTrades,
      mobilizations,
      scopes,
    });
    const groupedWithScopes = attachScopesToMobilizations(JSON.parse(JSON.stringify(groupedByTrade)), {
      projects,
      projectTrades,
      mobilizations,
      scopes,
    });
    const withSteps = buildStepsForMobilizations(JSON.parse(JSON.stringify(groupedWithScopes)));
    currentGroupedWithOffsets = withSteps;

    setStatus(
      `Loaded ${projects.length} projects, ${mobilizations.length} mobilizations, ${scopes.length} scopes, and ${projectTrades.length} project trades`
    );
    console.log("GROUPED:", groupedByTrade);
    console.log("WITH SCOPES:", groupedWithScopes);
    console.log("WITH STEPS:", withSteps);
    console.log("WITH TIMELINE:", withSteps);
    console.log("WITH VISUAL BARS:", withSteps);
    renderGroupedMobilizations(currentGroupedWithOffsets);
    output.textContent = [
      "Projects",
      JSON.stringify(projects, null, 2),
      "",
      "Mobilizations",
      JSON.stringify(mobilizations, null, 2),
      mobilizations.length === 0 ? "\n(no mobilizations returned; access is still proven)" : "",
      "",
      "Scopes",
      JSON.stringify(scopes, null, 2),
      scopes.length === 0 ? "\n(no scopes returned; access is still proven)" : "",
      "",
      "Project Trades",
      JSON.stringify(projectTrades, null, 2),
      projectTrades.length === 0 ? "\n(no project trades returned; access is still proven)" : "",
      "",
      "Grouped By Trade",
      JSON.stringify(groupedByTrade, null, 2),
      "",
      "Grouped With Scopes",
      JSON.stringify(groupedWithScopes, null, 2),
      "",
      "With Timeline",
      JSON.stringify(withSteps, null, 2),
    ].join("\n");
  } catch (err) {
    setStatus("Dataverse request failed");
    output.textContent = "❌ API failed: " + err.message;
  }
};
