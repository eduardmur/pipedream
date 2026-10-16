import app from "../../searcherries.app.mjs";
import constants from "../../common/constants.mjs";
import { pluralize } from "../../common/utils.mjs";

export default {
  key: "searcherries-get-action-plan",
  name: "Get Action Plan",
  description: "Get prioritized next steps for a Searcherries project: up to ten actions for a business, marketing or SEO audience, each with dated evidence, a suggested owner, a success measure, a link to the matching Searcherries report and `next_request`, the API request that returns the supporting rows. Actions come from four stored signals: answers that are negative about the brand or name a drawback, answers where the brand is not named, Search Console and Bing queries with many impressions and few clicks, and the landing pages of AI visitors. `status` is `ready`, `needs_data` (not enough stored data yet) or `no_priority_signals`; `data_notes` explain missing or stale sources. The plan is a suggestion built from stored data and does not estimate impact, effort or revenue. Use it as the first step of a report or a weekly digest, then **Get AI Answers**, **Get Search Performance** or **Get AI Traffic** for the rows behind an action. Use **List Projects** to find the Project ID. [See the documentation](https://searcherries.com/docs/api/endpoints#get-projectsprojectaction-plan)",
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
    audience: {
      type: "string",
      label: "Audience",
      description: "Who the plan is for. `business` (default) orders by traffic and business priorities, `marketing` by brand answers and content, `seo` by search pages and queries, e.g. `marketing`.",
      options: constants.AUDIENCES,
      optional: true,
    },
    period: {
      propDefinition: [
        app,
        "reportPeriod",
      ],
      description: "AI visibility report period for the answer signals, e.g. `last_30_days`. Defaults to `last_30_days`. Search and traffic signals use their own rolling 30-day snapshots.",
    },
    limit: {
      type: "integer",
      label: "Maximum Actions",
      description: "Maximum number of actions to return, `1` to `10`, e.g. `3`. Defaults to `5`. Fewer are returned when the evidence is thin.",
      min: 1,
      max: constants.MAX_ACTION_PLAN_LIMIT,
      optional: true,
    },
  },
  async run({ $ }) {
    const response = await this.app.getActionPlan({
      $,
      projectId: this.projectId,
      params: {
        audience: this.audience,
        period: this.period,
        limit: this.limit,
      },
    });

    const brand = response?.snapshot?.profile?.brand_name ?? `project ${this.projectId}`;
    const audience = response?.audience ?? this.audience ?? "business";
    const count = response?.actions?.length ?? 0;
    if (response?.status && response.status !== "ready") {
      const notes = response.data_notes?.length ?? 0;
      $.export("$summary", `No action plan for ${brand} yet (${response.status}, ${notes} data ${pluralize(notes, "note")})`);
      return response;
    }
    $.export("$summary", `Built an action plan with ${count} ${pluralize(count, "action")} for the ${audience} audience of ${brand}`);
    return response;
  },
};
