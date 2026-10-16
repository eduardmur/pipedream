const BASE_URL = "https://app.searcherries.com/api/v1";
const DOCS_URL = "https://searcherries.com/docs/api/endpoints";
const PLANS_URL = "https://app.searcherries.com/plans";
const TOKENS_URL = "https://app.searcherries.com/mcp";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const MAX_COMPETITOR_LIMIT = 50;
const MAX_ACTION_PLAN_LIMIT = 10;
const DEFAULT_ACTION_PLAN_LIMIT = 5;
const ANSWER_TEXT_PAGE_CAP = 20;

const REPORT_PERIODS = [
  "last_30_days",
  "last_60_days",
  "last_90_days",
  "this_year",
  "last_year",
];
const DEFAULT_REPORT_PERIOD = "last_30_days";

const CONNECTED_PERIODS = [
  "30d",
  "90d",
  "365d",
];
const DEFAULT_CONNECTED_PERIOD = "30d";

const PLATFORMS = [
  "chatgpt",
  "perplexity",
  "ai_overviews",
  "gemini",
  "claude",
  "grok",
];

const SUMMARY_BLOCKS = [
  "profile",
  "questions",
  "ai_visibility",
  "answer_insights",
  "competitors",
  "citations",
  "search",
  "ai_traffic",
  "connections",
  "recommendations",
];

const SEARCH_SOURCES = [
  "google",
  "bing",
];

const SEARCH_DATASETS = [
  "summary",
  "top_queries",
  "top_pages",
  "top_countries",
  "queries_by_country",
  "opportunities",
  "trends",
  "ai_question_queries",
  "daily",
  "history",
];

const SEARCH_SORT_KEYS = [
  "clicks",
  "impressions",
  "ctr",
  "position",
];

const COMPETITOR_DATASETS = [
  "ranking",
  "detail",
  "history",
];

const CITATION_GROUPINGS = [
  "url",
  "domain",
];

const AI_TRAFFIC_DATASETS = [
  "summary",
  "sources",
  "landing_pages",
  "daily",
  "history",
];

const AI_TRAFFIC_SOURCES = [
  "chatgpt",
  "gemini",
  "perplexity",
  "claude",
  "copilot",
  "meta_ai",
  "other_ai_assistants",
  "ai_overviews",
];

const AUDIENCES = [
  "business",
  "marketing",
  "seo",
];

export default {
  BASE_URL,
  DOCS_URL,
  PLANS_URL,
  TOKENS_URL,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_COMPETITOR_LIMIT,
  MAX_ACTION_PLAN_LIMIT,
  DEFAULT_ACTION_PLAN_LIMIT,
  ANSWER_TEXT_PAGE_CAP,
  REPORT_PERIODS,
  DEFAULT_REPORT_PERIOD,
  CONNECTED_PERIODS,
  DEFAULT_CONNECTED_PERIOD,
  PLATFORMS,
  SUMMARY_BLOCKS,
  SEARCH_SOURCES,
  SEARCH_DATASETS,
  SEARCH_SORT_KEYS,
  COMPETITOR_DATASETS,
  CITATION_GROUPINGS,
  AI_TRAFFIC_DATASETS,
  AI_TRAFFIC_SOURCES,
  AUDIENCES,
};
