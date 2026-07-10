/**
 * Scheduled data-refresh script.
 *
 * Pulls a signal of "what's trending in local LLMs this week" from Hugging
 * Face (trending text-generation models) and Hacker News (recent stories
 * matching local-inference keywords), and writes the merged snapshot to
 * data/trending.json. Run locally via `npm run refresh-data`, and weekly in
 * CI via .github/workflows/weekly-refresh.yml.
 *
 * Matching the trending signal to specific catalog entries (data/models.json)
 * and weighting it into the solver's ranking is BUILD-phase work; this
 * script's job is only to produce a fresh, honest snapshot.
 */

interface TrendingEntry {
  source: "huggingface" | "hackernews";
  id: string;
  title: string;
  url: string;
  score: number;
}

const HF_TRENDING_URL =
  "https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=15&filter=text-generation";

const HN_SEARCH_URL = (sinceUnix: number) =>
  `https://hn.algolia.com/api/v1/search?query=local%20llm&tags=story&numericFilters=created_at_i%3E${sinceUnix}`;

async function fetchHuggingFaceTrending(): Promise<TrendingEntry[]> {
  const res = await fetch(HF_TRENDING_URL);
  if (!res.ok) throw new Error(`Hugging Face API responded ${res.status}`);
  const models: Array<{ id: string; trendingScore: number }> = await res.json();
  return models.map((model) => ({
    source: "huggingface",
    id: model.id,
    title: model.id,
    url: `https://huggingface.co/${model.id}`,
    score: model.trendingScore,
  }));
}

async function fetchHackerNewsTrending(): Promise<TrendingEntry[]> {
  const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  const res = await fetch(HN_SEARCH_URL(oneWeekAgo));
  if (!res.ok) throw new Error(`Hacker News API responded ${res.status}`);
  const body: { hits: Array<{ objectID: string; title: string; url: string | null; points: number }> } =
    await res.json();
  return body.hits.map((hit) => ({
    source: "hackernews",
    id: hit.objectID,
    title: hit.title,
    url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
    score: hit.points,
  }));
}

async function main() {
  const [hf, hn] = await Promise.all([fetchHuggingFaceTrending(), fetchHackerNewsTrending()]);
  const snapshot = {
    fetchedAt: new Date().toISOString(),
    entries: [...hf, ...hn].sort((a, b) => b.score - a.score),
  };

  const { writeFile, mkdir } = await import("node:fs/promises");
  await mkdir(new URL("../data/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../data/trending.json", import.meta.url),
    `${JSON.stringify(snapshot, null, 2)}\n`,
  );

  console.log(`Wrote ${snapshot.entries.length} trending entries.`);
}

main().catch((err) => {
  console.error("Trending refresh failed:", err);
  process.exitCode = 1;
});
