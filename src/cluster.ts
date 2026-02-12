import cluster from "node:cluster";
import os from "node:os";

const NUM_WORKERS = process.env.WEB_CONCURRENCY
  ? parseInt(process.env.WEB_CONCURRENCY, 10)
  : Math.min(os.cpus().length, 2);

if (cluster.isPrimary) {
  console.log(
    `[Cluster] Primary ${process.pid} starting ${NUM_WORKERS} workers`,
  );

  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code) => {
    console.log(
      `[Cluster] Worker ${worker.process.pid} exited (code: ${code}). Restarting...`,
    );
    cluster.fork();
  });
} else {
  console.log(`[Cluster] Worker ${process.pid} starting`);
  import("./main");
}
