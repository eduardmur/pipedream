import { ConfigurationError } from "@pipedream/platform";
import app from "../../searcherries.app.mjs";
import constants from "../../common/constants.mjs";
import {
  describePage, isIsoDate,
} from "../../common/utils.mjs";

export default {
  key: "searcherries-get-ai-answers",
  name: "Get AI Answers",
  description: "List the AI answers Searcherries stored for the tracked customer questions of a project, one row per check and platform, joined with their judgments: `prominence_level` (`0` not named, `1` named in passing, `2` one of the options, `3` top recommendation), `on_topic`, `names_brands`, `brand_sentiment`, `brand_drawback`, `evidence_quote`, the cited URLs and the web searches the platform ran. Set Maximum Prominence to `1` to list the questions where the brand is missing, Only Flagged to `true` for negative, drawback or off-topic answers. Answer text is excluded unless Include Answer Text is `true`, which caps the page at 20 rows. `brand_mentioned` is `null` for answers the nightly judgment has not reached yet. Use **List Projects** for the Project ID and **Get Project Summary** for question IDs. [See the documentation](https://searcherries.com/docs/api/endpoints#get-projectsprojectanswers)",
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
      description: "AI visibility report period, e.g. `last_30_days`. Defaults to `last_30_days`. Ignored when Since or Until is given.",
    },
    since: {
      type: "string",
      label: "Since",
      description: "First check date to include, `YYYY-MM-DD`, e.g. `2026-09-01`. Overrides Period together with Until.",
      optional: true,
    },
    until: {
      type: "string",
      label: "Until",
      description: "Last check date to include, `YYYY-MM-DD`, e.g. `2026-09-30`.",
      optional: true,
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
    platform: {
      propDefinition: [
        app,
        "platform",
      ],
    },
    prominenceMax: {
      type: "integer",
      label: "Maximum Prominence",
      description: "Keep answers whose brand prominence is at most this level, `0` to `3`, e.g. `1` to list the answers where the brand is missing or only named in passing (the gaps). Omit for every level.",
      min: 0,
      max: 3,
      optional: true,
    },
    onlyFlagged: {
      type: "boolean",
      label: "Only Flagged",
      description: "Set to `true` to keep only answers judged negative about the brand, naming a drawback, or off topic, e.g. `true`. Defaults to `false`.",
      optional: true,
    },
    includeAnswerText: {
      type: "boolean",
      label: "Include Answer Text",
      description: "Set to `true` to include the stored answer text in each row, e.g. `true`. Caps the page at 20 rows. Defaults to `false`.",
      optional: true,
    },
    maxAnswerChars: {
      type: "integer",
      label: "Maximum Answer Characters",
      description: "Characters of answer text per row when Include Answer Text is `true`, `200` to `20000`, e.g. `3000`. Defaults to `1200`.",
      min: 200,
      max: 20000,
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
    if (this.since && !isIsoDate(this.since)) {
      throw new ConfigurationError("Since must be a date in the form YYYY-MM-DD, e.g. 2026-09-01.");
    }
    if (this.until && !isIsoDate(this.until)) {
      throw new ConfigurationError("Until must be a date in the form YYYY-MM-DD, e.g. 2026-09-30.");
    }
    if (this.includeAnswerText && this.limit > constants.ANSWER_TEXT_PAGE_CAP) {
      console.log(`Include Answer Text caps the page at ${constants.ANSWER_TEXT_PAGE_CAP} rows; the API ignores a larger limit.`);
    }

    const response = await this.app.listAnswers({
      $,
      projectId: this.projectId,
      params: {
        period: this.period,
        since: this.since,
        until: this.until,
        prompt_id: this.promptId,
        platform: this.platform,
        prominence_max: this.prominenceMax,
        only_flagged: this.onlyFlagged,
        include_answer_text: this.includeAnswerText,
        max_answer_chars: this.maxAnswerChars,
        limit: this.limit,
        offset: this.offset,
      },
    });
    const brand = response?.project?.brand_name ?? `project ${this.projectId}`;
    $.export("$summary", `Retrieved ${describePage(response?.pagination, "AI answer")} for ${brand}`);
    return response;
  },
};
