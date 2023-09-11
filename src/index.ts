import { Elysia } from "elysia";

import * as promClient from "prom-client";

const PORT = process.env.PORT || 6543;
const BASE_URL = process.env.BASE_URL || "https://p2pool.observer";
const ADDRESS = process.env.ADDRESS || "";

const url = `${BASE_URL}/api/miner_info/${ADDRESS}`;

const Gauge = promClient.Gauge;

const lastShareHeightGauge = new Gauge({
  name: "last_share_height",
  help: "Height of last share",
});

const lastShareTimeGauge = new Gauge({
  name: "last_share_timestamp",
  help: "Time of last share",
});

const blocksGauge = new Gauge({
  name: "blocks_count",
  help: "Number of blocks",
});

const unclesGauge = new Gauge({
  name: "uncles_count",
  help: "Number of uncles",
});

interface IResponse {
  last_share_height: number;
  last_share_timestamp: number;
  shares: Array<{
    shares: number;
    uncles: number;
  }>;
}

const app = new Elysia()
  .get("/", () => {
    throw new Error("go to /metrics");
  })
  .get("/metrics", async () => {
    try {
      const response = (await (await fetch(url)).json()) as IResponse;
      const lastShareHeight = response.last_share_height;
      const lastShareTime = response.last_share_timestamp;
      const blocks = response.shares
        .map((share) => share.shares)
        .reduce((a, b) => a + b, 0);
      const uncles = response.shares
        .map((share) => share.uncles)
        .reduce((a, b) => a + b, 0);
      lastShareHeightGauge.set(lastShareHeight);
      lastShareTimeGauge.set(lastShareTime);
      blocksGauge.set(blocks);
      unclesGauge.set(uncles);
      return promClient.register.metrics();
    } catch (error) {
      return error;
    }
  })
  .listen(PORT);

console.log(
  `hundehausen/p2pool-exporter is running at ${app.server?.hostname}:${app.server?.port}`
);
