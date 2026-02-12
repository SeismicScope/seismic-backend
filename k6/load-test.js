import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const rateLimited = new Rate("rate_limited");
const earthquakesDuration = new Trend("earthquakes_duration", true);
const mapDuration = new Trend("map_duration", true);
const analyticsDuration = new Trend("analytics_duration", true);

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000/api/v1";

// 429 = rate limiter working as expected, not a server error
function isOk(r) {
  return r.status >= 200 && r.status < 400;
}
function isAcceptable(r) {
  return isOk(r) || r.status === 429;
}
function trackResponse(r) {
  if (r.status === 429) rateLimited.add(1);
  else rateLimited.add(0);
  if (!isAcceptable(r)) errorRate.add(1);
  else errorRate.add(0);
}

export const options = {
  scenarios: {
    smoke: {
      executor: "constant-vus",
      vus: 3,
      duration: "30s",
      tags: { test_type: "smoke" },
    },
    load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 30 },
        { duration: "1m", target: 30 },
        { duration: "30s", target: 0 },
      ],
      startTime: "35s",
      tags: { test_type: "load" },
    },
    spike: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 200 },
        { duration: "30s", target: 200 },
        { duration: "10s", target: 0 },
      ],
      startTime: "3m40s",
      tags: { test_type: "spike" },
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    errors: ["rate<0.05"],
    earthquakes_duration: ["p(95)<1500"],
    map_duration: ["p(95)<2000"],
    analytics_duration: ["p(95)<1500"],
  },
};

export default function () {
  // Health check
  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    "health: ok": (r) => isAcceptable(r),
  });
  trackResponse(health);

  sleep(0.5);

  // Earthquakes list (paginated)
  const earthquakes = http.get(
    `${BASE_URL}/earthquakes?limit=20&sort=date_desc`,
  );
  check(earthquakes, {
    "earthquakes: ok": (r) => isAcceptable(r),
    "earthquakes: has data": (r) => {
      if (r.status === 429) return true;
      try {
        return r.json().data.length > 0;
      } catch {
        return false;
      }
    },
  });
  trackResponse(earthquakes);
  if (isOk(earthquakes)) earthquakesDuration.add(earthquakes.timings.duration);

  sleep(0.3);

  // Earthquakes with filters
  const filtered = http.get(
    `${BASE_URL}/earthquakes?limit=20&minMag=4&maxMag=7&sort=magnitude_desc`,
  );
  check(filtered, { "filtered: ok": (r) => isAcceptable(r) });
  trackResponse(filtered);
  if (isOk(filtered)) earthquakesDuration.add(filtered.timings.duration);

  sleep(0.3);

  // Single earthquake
  const single = http.get(`${BASE_URL}/earthquakes/1`);
  check(single, {
    "single: ok": (r) => isAcceptable(r) || r.status === 404,
  });
  trackResponse(single);

  sleep(0.3);

  // Map (spatial query — global viewport)
  const map = http.get(
    `${BASE_URL}/map?west=-180&south=-90&east=180&north=90&zoom=3`,
  );
  check(map, {
    "map: ok": (r) => isAcceptable(r),
    "map: has data": (r) => {
      if (r.status === 429) return true;
      try {
        return Array.isArray(r.json().data);
      } catch {
        return false;
      }
    },
  });
  trackResponse(map);
  if (isOk(map)) mapDuration.add(map.timings.duration);

  sleep(0.3);

  // Map (zoomed in — smaller viewport)
  const mapZoomed = http.get(
    `${BASE_URL}/map?west=130&south=30&east=145&north=45&zoom=7`,
  );
  check(mapZoomed, { "map zoomed: ok": (r) => isAcceptable(r) });
  trackResponse(mapZoomed);
  if (isOk(mapZoomed)) mapDuration.add(mapZoomed.timings.duration);

  sleep(0.3);

  // Analytics: time-series
  const timeSeries = http.get(
    `${BASE_URL}/analytics/time-series?interval=month`,
  );
  check(timeSeries, {
    "time-series: ok": (r) => isAcceptable(r),
    "time-series: is array": (r) => {
      if (r.status === 429) return true;
      try {
        return Array.isArray(r.json());
      } catch {
        return false;
      }
    },
  });
  trackResponse(timeSeries);
  if (isOk(timeSeries)) analyticsDuration.add(timeSeries.timings.duration);

  sleep(0.3);

  // Analytics: stats
  const stats = http.get(`${BASE_URL}/analytics/stats`);
  check(stats, {
    "stats: ok": (r) => isAcceptable(r),
    "stats: has totalEvents": (r) => {
      if (r.status === 429) return true;
      try {
        return r.json().totalEvents !== undefined;
      } catch {
        return false;
      }
    },
  });
  trackResponse(stats);
  if (isOk(stats)) analyticsDuration.add(stats.timings.duration);

  sleep(0.3);

  // Magnitude histogram
  const histogram = http.get(`${BASE_URL}/earthquakes/magnitude-histogram`);
  check(histogram, {
    "histogram: ok": (r) => isAcceptable(r),
    "histogram: is array": (r) => {
      if (r.status === 429) return true;
      try {
        return Array.isArray(r.json());
      } catch {
        return false;
      }
    },
  });
  trackResponse(histogram);
  if (isOk(histogram)) analyticsDuration.add(histogram.timings.duration);

  sleep(0.5);
}

export function handleSummary(data) {
  const now = new Date().toISOString().replace(/[:.]/g, "-");
  return {
    [`k6/results/summary-${now}.json`]: JSON.stringify(data, null, 2),
  };
}
