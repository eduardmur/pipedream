import { axios } from "@pipedream/platform";
import constants from "./common/constants.mjs";
import { describeApiError } from "./common/utils.mjs";

export default {
  type: "app",
  app: "searcherries",
  propDefinitions: {
    projectId: {
      type: "integer",
      label: "Project ID",
      description: "The numeric ID of the Searcherries project, e.g. `123`. Use **List Projects** to find it (the `id` field of each project).",
      async options() {
        const { projects = [] } = await this.listProjects();
        return projects.map(({
          id, brand_name: brandName, brand_website: brandWebsite,
        }) => ({
          label: brandWebsite
            ? `${brandName} (${brandWebsite})`
            : brandName,
          value: id,
        }));
      },
    },
    reportPeriod: {
      type: "string",
      label: "Period",
      description: "AI visibility report period, anchored to the latest completed check. One of `last_30_days`, `last_60_days`, `last_90_days`, `this_year`, `last_year`, e.g. `last_30_days`. Defaults to `last_30_days`. A period without enough history falls back to the nearest available one; the `period` object of the response says which one was used.",
      options: constants.REPORT_PERIODS,
      optional: true,
    },
    connectedPeriod: {
      type: "string",
      label: "Window",
      description: "Rolling window of the stored snapshot, ending on the collection day. One of `30d`, `90d`, `365d`, e.g. `30d`. Defaults to `30d`.",
      options: constants.CONNECTED_PERIODS,
      optional: true,
    },
    platform: {
      type: "string",
      label: "AI Platform",
      description: "Restrict the rows to one AI platform. One of `chatgpt`, `perplexity`, `ai_overviews`, `gemini`, `claude`, `grok`, e.g. `chatgpt`. Omit for every platform.",
      options: constants.PLATFORMS,
      optional: true,
    },
    promptId: {
      type: "integer",
      label: "Question ID",
      description: "Restrict the rows to one tracked customer question, e.g. `456`. Use **Get Project Summary** to find it (the `id` of each entry in the `questions` block). Must belong to the project given in `projectId`.",
      optional: true,
      async options({ projectId }) {
        if (!projectId) {
          return [];
        }
        const { questions } = await this.getProjectSummary({
          projectId,
          params: {
            include: "questions",
          },
        });
        const tracked = [
          questions?.primary,
          ...(questions?.additional ?? []),
        ].filter(Boolean);
        return tracked.map(({
          id, question,
        }) => ({
          label: question,
          value: id,
        }));
      },
    },
    limit: {
      type: "integer",
      label: "Limit",
      description: "Rows per page, e.g. `25`. Minimum `1`, maximum `100`. Defaults to `25`.",
      min: 1,
      max: constants.MAX_LIMIT,
      optional: true,
    },
    offset: {
      type: "integer",
      label: "Offset",
      description: "Rows to skip, e.g. `25` for the second page of 25 rows. Defaults to `0`. Request the next page with a larger offset while `pagination.has_more` is `true`.",
      min: 0,
      optional: true,
    },
  },
  methods: {
    _baseUrl() {
      return constants.BASE_URL;
    },
    _headers(headers = {}) {
      return {
        Authorization: `Bearer ${this.$auth.personal_access_token}`,
        Accept: "application/json",
        ...headers,
      };
    },
    async _makeRequest({
      $ = this, path, headers, ...args
    } = {}) {
      try {
        return await axios($, {
          url: `${this._baseUrl()}${path}`,
          headers: this._headers(headers),
          ...args,
        });
      } catch (error) {
        // Keep the original error (status and response stay attached) but
        // replace the raw JSON body with the message of the API's error envelope
        // and what to do about it (paid plan, new token, retry_after, invalid params).
        const message = describeApiError(error);
        if (message) {
          error.message = message;
        }
        throw error;
      }
    },
    listProjects(args = {}) {
      return this._makeRequest({
        path: "/projects",
        ...args,
      });
    },
    getProjectSummary({
      projectId, ...args
    }) {
      return this._makeRequest({
        path: `/projects/${projectId}`,
        ...args,
      });
    },
    listAnswers({
      projectId, ...args
    }) {
      return this._makeRequest({
        path: `/projects/${projectId}/answers`,
        ...args,
      });
    },
    getSearchPerformance({
      projectId, ...args
    }) {
      return this._makeRequest({
        path: `/projects/${projectId}/search-performance`,
        ...args,
      });
    },
    getCompetitors({
      projectId, ...args
    }) {
      return this._makeRequest({
        path: `/projects/${projectId}/competitors`,
        ...args,
      });
    },
    getCitations({
      projectId, ...args
    }) {
      return this._makeRequest({
        path: `/projects/${projectId}/citations`,
        ...args,
      });
    },
    getAiTraffic({
      projectId, ...args
    }) {
      return this._makeRequest({
        path: `/projects/${projectId}/ai-traffic`,
        ...args,
      });
    },
    getActionPlan({
      projectId, ...args
    }) {
      return this._makeRequest({
        path: `/projects/${projectId}/action-plan`,
        ...args,
      });
    },
  },
};
