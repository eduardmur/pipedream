import { ConfigurationError } from "@pipedream/platform";
import app from "../../searcherries.app.mjs";
import constants from "../../common/constants.mjs";
import { toNumber } from "../../common/utils.mjs";

export default {
  key: "searcherries-get-search-performance",
  name: "Get Search Performance",
  description: "Get the Google Search Console or Bing Webmaster Tools data Searcherries stored for a project and one rolling window (`30d`, `90d` or `365d`): summary totals, top queries, top pages, top countries, queries by country, opportunities (high impressions with low CTR, long-tail queries), growing and falling trends, question-shaped Google queries, the daily series and a monthly history. Lists are the stored top sample (up to 50 rows per dimension, up to 1000 question-shaped queries), not an exhaustive export. When the source is not connected or the window has no stored data the response says `available: false` and `reason` explains why; check `fetched_at` and `is_stale` before combining numbers. Use **List Projects** to find the Project ID and to see which sources are connected. [See the documentation](https://searcherries.com/docs/api/endpoints#get-projectsprojectsearch-performance)",
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
    source: {
      type: "string",
      label: "Source",
      description: "`google` for Google Search Console or `bing` for Bing Webmaster Tools, e.g. `google`. Defaults to `google`.",
      options: constants.SEARCH_SOURCES,
      optional: true,
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
      description: "One of `summary` (totals, top-10 lists and counts), `top_queries`, `top_pages`, `top_countries`, `queries_by_country`, `opportunities`, `trends`, `ai_question_queries` (Google only), `daily`, `history` (monthly clicks and impressions), e.g. `top_queries`. Defaults to `summary`.",
      options: constants.SEARCH_DATASETS,
      optional: true,
    },
    queryContains: {
      type: "string",
      label: "Query Contains",
      description: "Case-insensitive substring filter on the query text for `top_queries` and `ai_question_queries`, e.g. `pricing`.",
      optional: true,
    },
    pageContains: {
      type: "string",
      label: "Page Contains",
      description: "Case-insensitive substring filter on the page URL for `top_pages`, e.g. `/blog/`.",
      optional: true,
    },
    country: {
      type: "string",
      label: "Country",
      description: "Three-letter country code as stored by the provider for `top_countries` and `queries_by_country`, e.g. `usa` or `deu`.",
      optional: true,
    },
    minImpressions: {
      type: "integer",
      label: "Minimum Impressions",
      description: "Keep rows with at least this many impressions, e.g. `100`.",
      min: 0,
      optional: true,
    },
    minClicks: {
      type: "integer",
      label: "Minimum Clicks",
      description: "Keep rows with at least this many clicks, e.g. `5`.",
      min: 0,
      optional: true,
    },
    minPosition: {
      type: "string",
      label: "Minimum Position",
      description: "Keep rows with an average position greater than or equal to this value, e.g. `4` or `10.5`. A larger position means further down the results.",
      optional: true,
    },
    maxPosition: {
      type: "string",
      label: "Maximum Position",
      description: "Keep rows with an average position less than or equal to this value, e.g. `20`. Must not be lower than Minimum Position.",
      optional: true,
    },
    sort: {
      type: "string",
      label: "Sort",
      description: "Sort key for the list datasets. One of `clicks`, `impressions`, `ctr` (descending) or `position` (ascending), e.g. `impressions`. Defaults to `clicks`.",
      options: constants.SEARCH_SORT_KEYS,
      optional: true,
    },
    limit: {
      propDefinition: [
        app,
        "limit",
      ],
      description: "Rows per page for the list datasets, e.g. `25`. Minimum `1`, maximum `100`. Defaults to `25`.",
    },
    offset: {
      propDefinition: [
        app,
        "offset",
      ],
    },
  },
  async run({ $ }) {
    const source = this.source ?? "google";
    const dataset = this.dataset ?? "summary";
    if (source === "bing" && dataset === "ai_question_queries") {
      throw new ConfigurationError("The `ai_question_queries` dataset is only available for the `google` source.");
    }
    const minPosition = toNumber(this.minPosition);
    const maxPosition = toNumber(this.maxPosition);
    if (Number.isNaN(minPosition) || Number.isNaN(maxPosition)) {
      throw new ConfigurationError("Minimum Position and Maximum Position must be numbers, e.g. `4` or `10.5`.");
    }
    if (minPosition !== undefined && maxPosition !== undefined && maxPosition < minPosition) {
      throw new ConfigurationError("Maximum Position must not be lower than Minimum Position.");
    }

    const response = await this.app.getSearchPerformance({
      $,
      projectId: this.projectId,
      params: {
        source,
        period: this.period,
        dataset,
        query_contains: this.queryContains,
        page_contains: this.pageContains,
        country: this.country,
        min_impressions: this.minImpressions,
        min_clicks: this.minClicks,
        min_position: minPosition,
        max_position: maxPosition,
        sort: this.sort,
        limit: this.limit,
        offset: this.offset,
      },
    });

    const sourceName = source === "bing"
      ? "Bing Webmaster Tools"
      : "Google Search Console";
    const brand = response?.project?.brand_name ?? `project ${this.projectId}`;
    const window = response?.period?.key ?? this.period ?? constants.DEFAULT_CONNECTED_PERIOD;
    if (response?.available === false) {
      $.export("$summary", `No ${sourceName} data stored for ${brand} (${window}): ${response.reason ?? "not available"}`);
      return response;
    }
    const rows = response?.rows?.length;
    const detail = rows === undefined
      ? ""
      : ` with ${rows} rows`;
    $.export("$summary", `Retrieved the ${sourceName} ${dataset} dataset (${window}) for ${brand}${detail}`);
    return response;
  },
};
