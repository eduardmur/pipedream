import app from "../../searcherries.app.mjs";
import constants from "../../common/constants.mjs";

export default {
  key: "searcherries-get-ai-traffic",
  name: "Get AI Traffic",
  description: "Get the Google Analytics 4 traffic Searcherries stored for a project and one rolling window (`30d`, `90d` or `365d`): all-site totals for context, AI-referral traffic (sessions, users, engaged sessions, key events, conversions, share of all sessions) per AI source, the landing pages AI visitors arrive on, the daily series and a monthly history. Dataset `summary` (default) gives the totals, `sources` one entry per AI source with its top landing pages and referrers, `landing_pages` a flat filterable list, `daily` the series and `history` monthly AI sessions per platform. When GA4 is not connected or the window has no stored data the response says `available: false` and `reason` explains why. Use **List Projects** to find the Project ID and to see whether GA4 is connected. [See the documentation](https://searcherries.com/docs/api/endpoints#get-projectsprojectai-traffic)",
  version: "0.0.1",
  type: "action",
  ai: "optimized",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    app,
    projectId: {
      propDefinition: [
        app,
        "projectId",
      ],
    },
    period: {
      propDefinition: [
        app,
        "connectedPeriod",
      ],
    },
    dataset: {
      type: "string",
      label: "Dataset",
      description: "One of `summary`, `sources`, `landing_pages`, `daily`, `history`, e.g. `landing_pages`. Defaults to `summary`.",
      options: constants.AI_TRAFFIC_DATASETS,
      optional: true,
    },
    source: {
      type: "string",
      label: "AI Source",
      description: "Restrict the `sources` or `landing_pages` dataset to one AI source. One of `chatgpt`, `gemini`, `perplexity`, `claude`, `copilot`, `meta_ai`, `other_ai_assistants`, `ai_overviews`, e.g. `chatgpt`. Omit for every source.",
      options: constants.AI_TRAFFIC_SOURCES,
      optional: true,
    },
    pathContains: {
      type: "string",
      label: "Path Contains",
      description: "Case-insensitive substring filter on the landing page path for `landing_pages`, e.g. `/pricing`.",
      optional: true,
    },
    limit: {
      propDefinition: [
        app,
        "limit",
      ],
      description: "Rows per page for `landing_pages`, e.g. `25`. Minimum `1`, maximum `100`. Defaults to `25`.",
    },
    offset: {
      propDefinition: [
        app,
        "offset",
      ],
    },
  },
  async run({ $ }) {
    const dataset = this.dataset ?? "summary";
    const response = await this.app.getAiTraffic({
      $,
      projectId: this.projectId,
      params: {
        period: this.period,
        dataset,
        source: this.source,
        path_contains: this.pathContains,
        limit: this.limit,
        offset: this.offset,
      },
    });

    const brand = response?.project?.brand_name ?? `project ${this.projectId}`;
    const window = response?.period?.key ?? this.period ?? constants.DEFAULT_CONNECTED_PERIOD;
    if (response?.available === false) {
      $.export("$summary", `No GA4 AI traffic stored for ${brand} (${window}): ${response.reason ?? "not available"}`);
      return response;
    }
    const rows = response?.rows?.length;
    const detail = rows === undefined
      ? ""
      : ` with ${rows} rows`;
    $.export("$summary", `Retrieved the GA4 AI traffic ${dataset} dataset (${window}) for ${brand}${detail}`);
    return response;
  },
};
