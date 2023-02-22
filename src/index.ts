import express, { Express, Request, Response } from "express";
import * as promClient from "prom-client";
import "dotenv/config";
import axios from "axios";

const PORT = process.env.PORT || 6543;
const BASE_URL = process.env.BASE_URL || "https://p2pool.observer";
const ADDRESS = process.env.ADDRESS || "";

const Gauge = promClient.Gauge;

const app: Express = express();

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

type JsonResponse = {
  last_share_height: number;
  last_share_timestamp: number;
  shares: {
    blocks: number;
    uncles: number;
  };
};

const main = async () => {
  app.get("/", (req: Request, res: Response) => {
    res.send("serving at /metrics");
  });

  app.get("/metrics", async (req: Request, res: Response) => {
    const url = `${BASE_URL}/api/miner_info/${ADDRESS}`;
    try {
      const response = await axios.get(url);
      const p2poolInfo = response.data;
      const lastShareHeight = p2poolInfo.last_share_height;
      const lastShareTime = p2poolInfo.last_share_timestamp;
      const blocks = p2poolInfo.shares.blocks;
      const uncles = p2poolInfo.shares.uncles;
      lastShareHeightGauge.set(lastShareHeight);
      lastShareTimeGauge.set(lastShareTime);
      blocksGauge.set(blocks);
      unclesGauge.set(uncles);
      res.set("Content-Type", promClient.register.contentType);
      res.end(await promClient.register.metrics());
    } catch (error) {
      res.status(500).send(error);
    }
  });
};

main();

app.listen(PORT, () =>
  console.log(`hundehausen/p2pool-exporter serving on :${PORT}`)
);
