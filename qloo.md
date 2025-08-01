Here’s a structured “road-map” to the best places to learn Qloo’s API, grouped by purpose. I’ve listed the exact page titles or menu paths you’ll see once you reach the site, so you can jump straight to the right content.

## 1. Core Developer Docs

| What to read first                                            | Where to find it                                 | Why it matters                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **“API Overview”** in the **API Reference** section           | On the left-hand sidebar of the Qloo docs portal | Explains authentication, rate limits, request structure, and links out to every endpoint group. ([docs.qloo.com](https://docs.qloo.com/reference)) |
| **“API Quick Start”** (under API Reference → API Quick Start) | Same sidebar, one click above “API Overview”     | A copy-pastable hello-world call that shows how to hit Insights with curl/Postman. ([docs.qloo.com](https://docs.qloo.com/reference))              |
| **“Insights API Deep Dive”**                                  | API Reference → Insights API → Deep Dive         | Interactive explorer—lets you experiment with parameter combos and preview JSON responses live. ([docs.qloo.com](https://docs.qloo.com/reference)) |
| **“Lookup APIs”** section (Entity Search, Tag Search, etc.)   | API Reference → Lookup APIs                      | Teaches you how to grab the IDs you’ll need to feed into Insights. ([docs.qloo.com](https://docs.qloo.com/reference))                              |
| **“Analysis & Trends APIs”** section                          | API Reference → Analysis & Trends                | For cohort comparisons, trending entities, and WoW movement—handy for dashboards. ([docs.qloo.com](https://docs.qloo.com/reference))               |

## 2. Ready-made Code & Recipes

| Resource                                             | Where it is                                                  | Highlights                                                                                                                                                                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **“Recipes” collection**                             | Docs portal top-nav → **API Examples / Recipes**             | End-to-end snippets in Python & JavaScript that chain Lookup → Insights in one function. ([docs.qloo.com](https://docs.qloo.com/recipes))                                                                                                     |
| **Example scripts bundle**                           | Listed in the *Resources* tab of the Qloo LLM Hackathon site | Downloadable repo with curl, Node, Python, and Postman collections. ([Qloo LLM Hackathon](https://qloo-hackathon.devpost.com/resources))                                                                                                      |
| **Observable “Qloo API Explorer” notebook**          | Search for “Qloo API Explorer” on Observable                 | Live, reactive playground if you prefer to poke at the API in the browser. ([Observable](https://observablehq.com/%40qoby/qloo-api-explorer?utm_source=chatgpt.com))                                                                          |
| **Gitbook “Qloo API Guide”** (Capitol 360 hackathon) | Community-written guide from an earlier hackathon            | Extra hand-holding walkthrough of headers, auth tokens, and sample queries. ([cloudinary.gitbook.io](https://cloudinary.gitbook.io/cil-hackathon-guide/capitol360-december-2018-hacktathon-guide/qloo/qloo-api-guide?utm_source=chatgpt.com)) |

## 3. Concept & Capability Overviews

* **Qloo API product page** – concise marketing-grade summary of what you get (Recommendations, Audience Intelligence, Taste Analysis). ([qloo.com](https://www.qloo.com/products/api))
* **“Taste AI” technology page** – dives into the knowledge-graph under the hood and shows how the API plugs into Snowflake or S3 if you need bulk data. ([qloo.com](https://www.qloo.com/technology/taste-ai?utm_source=chatgpt.com))
* **“Recommendations” capability page** – concrete examples of cross-domain recs (e.g., linking music taste to travel spots). Useful for ideation. ([qloo.com](https://www.qloo.com/capabilities/recommendations?utm_source=chatgpt.com))

## 4. Inspiration, Talks & Case-studies

| Medium  | Link title                                                          | Why watch/read                                                                                                                                                                                                   |
| ------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Video   | “Qloo decodes consumer tastes globally” (YouTube)                   | Quick visual demo of the taste graph & API hooks. ([YouTube](https://www.youtube.com/watch?v=5QOY6OIpbMQ&utm_source=chatgpt.com))                                                                                |
| Article | Forbes: “Qloo — Leading AI advances culture and taste intelligence” | Business-side view of where the API is used in retail & media. ([Forbes](https://www.forbes.com/sites/cindygordon/2024/02/19/qloo-leading-ai-advances-culture-and-taste-intelligence/?utm_source=chatgpt.com))   |
| Podcast | SourceForge interview with Qloo’s CEO                               | Background story + API evolution from B2C to B2B. ([SourceForge](https://sourceforge.net/articles/sourceforge-podcast-with-qloo-a-fascinating-cultural-ai-that-predicts-consumer-taste/?utm_source=chatgpt.com)) |

## 5. Community & Support Channels

* **Qloo LLM Hackathon portal** – has a Discord invite, free API-key form, and office-hours schedule. Great place to ask questions. ([Qloo LLM Hackathon](https://qloo-hackathon.devpost.com/?utm_source=chatgpt.com))
* **@Qloo on X/Twitter** – product updates, new endpoints, and occasional code tips. ([X (formerly Twitter)](https://x.com/qloo?lang=en&utm_source=chatgpt.com))

### How to navigate quickly

1. Head to the docs portal and open **API Reference → API Overview** first—bookmark it.
2. Grab the **API Quick Start** curl example, swap in your bearer token (request it from the hackathon page form), and hit Insights once to confirm connectivity.
3. Use **Entity Search** to fetch a couple IDs you already know (e.g., your favorite film), then feed them into the **Insights API Deep Dive** to see real recommendations and demographic breakdowns.
4. Clone the example scripts repo to accelerate local testing; modify the helper functions to wrap Lookup + Insights for your own use case.
5. For inspiration or troubleshooting, browse the Observable notebook or join the hackathon Discord—Qloo engineers hang out there during work hours.

With these resources in hand you’ll have both the conceptual grounding and the practical code you need to start building on top of Qloo’s Taste AI.
