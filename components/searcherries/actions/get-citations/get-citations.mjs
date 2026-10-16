import app from "../../searcherries.app.mjs";
import constants from "../../common/constants.mjs";
import { describePage } from "../../common/utils.mjs";

export default {
  key: "searcherries-get-citations",
  name: "Get Citations",
  description: "Get the URLs or domains the AI platforms cite as sources when answering the tracked customer questions of a Searcherries project in the period. Group By `url` (default) returns each cited URL with its citation count, platforms, the questions it appeared for and whether it belongs to the project website; `domain` returns the most-cited domains. The AI Platform, Question ID, URL Contains and Own Site Only filters apply to the URL grouping (Question ID also to domains). Set Own Site Only to `true` to see which of your own pages the platforms cite. Use **Get AI Answers** to read the answers that cite a page. Use **List Projects** for the Project ID and **Get Project Summary** for question IDs. [See the documentation](https://searcherries.com/docs/api/endpoints#get-projectsprojectcitations)",
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
    groupBy: {
      type: "string",
      label: "Group By",
      description: "`url` for one row per cited URL or `domain` for the most-cited domains, e.g. `url`. Defaults to `url`.",
      options: constants.CITATION_GROUPINGS,
      optional: true,
    },
    platform: {
      propDefinition: [
        app,
        "platform",
      ],
    },
    promptId: {
      propDefinition: [
        app,
        "promptId",
        (c) => ({
          projectId: c.projectId,
        }),
      ],
    },
    urlContains: {
      type: "string",
      label: "URL Contains",
      description: "Case-insensitive substring filter on the cited URL, e.g. `reddit.com` or `/compare/`.",
      optional: true,
    },
    ownSiteOnly: {
      type: "boolean",
      label: "Own Site Only",
      description: "Set to `true` to keep only URLs on the project website, e.g. `true`. Defaults to `false`.",
      optional: true,
    },
    limit: {
      propDefinition: [
        app,
        "limit",
      ],
    },
    offset: {
      propDefinition: [
        app,
        "offset",
      ],
    },
  },
  async run({ $ }) {
    const groupBy = this.groupBy ?? "url";
    const response = await this.app.getCitations({
      $,
      projectId: this.projectId,
      params: {
        period: this.period,
        group_by: groupBy,
        platform: this.platform,
        prompt_id: this.promptId,
        url_contains: this.urlContains,
        own_site_only: this.ownSiteOnly,
        limit: this.limit,
        offset: this.offset,
      },
    });
    const brand = response?.project?.brand_name ?? `project ${this.projectId}`;
    const noun = groupBy === "domain"
      ? "cited domain"
      : "cited URL";
    $.export("$summary", `Retrieved ${describePage(response?.pagination, noun)} for ${brand}`);
    return response;
  },
};
