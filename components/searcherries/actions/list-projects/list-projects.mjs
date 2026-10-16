import app from "../../searcherries.app.mjs";
import { pluralize } from "../../common/utils.mjs";

export default {
  key: "searcherries-list-projects",
  name: "List Projects",
  description: "List the AI visibility projects of the connected Searcherries account with their status, tracked AI platforms, connected data sources (Google Analytics 4, Google Search Console, Bing Webmaster Tools) and their freshness, counts of stored data and the latest check date. Call this first: the `id` of each project is the Project ID every other Searcherries action takes. Takes no parameters and returns every project in one response. Projects that are not `ready` yet have no answers to read. [See the documentation](https://searcherries.com/docs/api/endpoints#get-projects)",
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
  },
  async run({ $ }) {
    const response = await this.app.listProjects({
      $,
    });
    const count = response?.projects?.length ?? response?.total ?? 0;
    $.export("$summary", `Found ${count} Searcherries ${pluralize(count, "project")}`);
    return response;
  },
};
