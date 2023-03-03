import express from "express";
import * as promClient from "prom-client";
import "dotenv/config";

const PORT = process.env.PORT || 6543;
const BASE_URL = process.env.BASE_URL || "https://p2pool.observer";
const ADDRESS = process.env.ADDRESS || "";

const Gauge = promClient.Gauge;

const app = express();

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

app.get("/", (req, res) => {
  res.status(404).send("<p>look for /metrics</p>");
});

app.get("/metrics", async (req, res) => {
  const url = `${BASE_URL}/api/miner_info/${ADDRESS}`;
  try {
    const response = await fetch(url);
    const json = await response.json();
    const lastShareHeight = json.last_share_height;
    const lastShareTime = json.last_share_timestamp;
    const blocks = json.shares.blocks;
    const uncles = json.shares.uncles;
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

app.listen(PORT, () =>
  console.log(`hundehausen/p2pool-exporter serving on :${PORT}`)
);
