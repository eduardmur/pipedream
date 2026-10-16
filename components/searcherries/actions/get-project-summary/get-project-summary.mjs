import app from "../../searcherries.app.mjs";
import constants from "../../common/constants.mjs";

export default {
  key: "searcherries-get-project-summary",
  name: "Get Project Summary",
  description: "Get one compact snapshot (about 16 KB) of a Searcherries project: profile and business profile, the tracked customer questions with their IDs, the AI visibility KPIs of the period (score, mentions by platform, change against the previous period, share of voice), the answer-insight summary, the top competitors and most-cited domains, 30-day Google Search Console, Bing and GA4 totals with top lists, connection health and the latest recommendation summary. Use it for an overview or to find question IDs; use **Get AI Answers**, **Get Competitors**, **Get Citations**, **Get Search Performance** and **Get AI Traffic** for rows and filters. Use **List Projects** to find the Project ID. [See the documentation](https://searcherries.com/docs/api/endpoints#get-projectsproject)",
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
        "reportPeriod",
      ],
    },
    include: {
      type: "string[]",
      label: "Include",
      description: "Blocks to include. Any of `profile`, `questions`, `ai_visibility`, `answer_insights`, `competitors`, `citations`, `search`, `ai_traffic`, `connections`, `recommendations`, e.g. `[\"profile\", \"ai_visibility\", \"connections\"]`. Omit for the whole summary.",
      options: constants.SUMMARY_BLOCKS,
      optional: true,
    },
  },
  async run({ $ }) {
    const response = await this.app.getProjectSummary({
      $,
      projectId: this.projectId,
      params: {
        period: this.period,
        include: this.include?.length
          ? this.include.join(",")
          : undefined,
      },
    });
    const brand = response?.profile?.brand_name ?? `project ${this.projectId}`;
    const blocks = response?.included?.length ?? 0;
    $.export("$summary", `Retrieved the summary of ${brand} (${blocks} blocks, period ${response?.period?.key ?? this.period ?? constants.DEFAULT_REPORT_PERIOD})`);
    return response;
  },
};
