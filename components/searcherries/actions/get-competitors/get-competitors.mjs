import { ConfigurationError } from "@pipedream/platform";
import app from "../../searcherries.app.mjs";
import constants from "../../common/constants.mjs";
import {
  describePage, pluralize,
} from "../../common/utils.mjs";

export default {
  key: "searcherries-get-competitors",
  name: "Get Competitors",
  description: "Get the brands the AI platforms name when answering the tracked customer questions of a Searcherries project. Dataset `ranking` (default) returns one row per brand for the period, the own brand included, ranked by visibility with mentions, citations, average position, per-platform numbers and a few deduplicated highlights of what the platforms say about each brand. Dataset `detail` returns one brand (a name or name fragment in Competitor) with all its highlights. Dataset `history` returns the stored month-by-month snapshots. Use **Get AI Answers** with a platform filter to read the answers behind a ranking and **Get Citations** for the pages the platforms cite. Use **List Projects** to find the Project ID. [See the documentation](https://searcherries.com/docs/api/endpoints#get-projectsprojectcompetitors)",
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
    dataset: {
      type: "string",
      label: "Dataset",
      description: "One of `ranking` (one row per brand, the own brand included), `detail` (one brand with all its highlights; requires Competitor) or `history` (month-by-month snapshots), e.g. `ranking`. Defaults to `ranking`.",
      options: constants.COMPETITOR_DATASETS,
      optional: true,
    },
    competitor: {
      type: "string",
      label: "Competitor",
      description: "Brand name or a fragment of it, e.g. `Semrush`. Required when Dataset is `detail`. Use the `ranking` dataset to see the brand names Searcherries tracks.",
      optional: true,
    },
    includeHighlights: {
      type: "boolean",
      label: "Include Highlights",
      description: "Set to `false` to leave the per-platform highlight sentences out of the ranking rows, e.g. `false`. Defaults to `true`.",
      optional: true,
    },
    highlightsPerPlatform: {
      type: "integer",
      label: "Highlights Per Platform",
      description: "Highlight sentences per platform in each ranking row, `0` to `5`, e.g. `2`. Defaults to `3`.",
      min: 0,
      max: 5,
      optional: true,
    },
    limit: {
      propDefinition: [
        app,
        "limit",
      ],
      description: "Rows per page for `ranking` (default `15`, maximum `50`) or months for `history` (default `12`), e.g. `20`.",
      max: constants.MAX_COMPETITOR_LIMIT,
    },
    offset: {
      propDefinition: [
        app,
        "offset",
      ],
    },
  },
  async run({ $ }) {
    const dataset = this.dataset ?? "ranking";
    if (dataset === "detail" && !this.competitor?.trim()) {
      throw new ConfigurationError("Competitor is required when Dataset is `detail`.");
    }

    const response = await this.app.getCompetitors({
      $,
      projectId: this.projectId,
      params: {
        period: this.period,
        dataset,
        competitor: this.competitor,
        include_highlights: this.includeHighlights,
        highlights_per_platform: this.highlightsPerPlatform,
        limit: this.limit,
        offset: this.offset,
      },
    });

    const brand = response?.project?.brand_name ?? `project ${this.projectId}`;
    if (dataset === "detail") {
      $.export("$summary", response?.found
        ? `Found competitor ${response.competitor?.competitor_name ?? response.competitor?.name ?? this.competitor} of ${brand}`
        : `No competitor of ${brand} matches "${this.competitor}"`);
      return response;
    }
    if (dataset === "history") {
      const months = response?.months_returned ?? response?.rows?.length ?? 0;
      $.export("$summary", `Retrieved ${months} ${pluralize(months, "month")} of competitor history for ${brand}`);
      return response;
    }
    $.export("$summary", `Retrieved ${describePage(response?.pagination, "competitor row")} for ${brand}`);
    return response;
  },
};
