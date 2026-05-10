const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function ingestStrictGameNewsV2() {
  console.log("Cleaning up old contaminated game news...");
  await supabase.from('news_article').delete().eq('category', 'game');

  console.log("Fetching STRICT gaming news (V2 - Dual Layer Filter)...");
  
  const query = `(gaming OR "video games" OR PlayStation OR Nintendo OR Xbox) -drone -camera -laptop -phone -Ryzen -Intel -bike -scooter -deal -sale -shipping -soundbar -subwoofer -bundle`;
  const url = `https://newsapi.org/v2/everything?sources=ign,polygon&q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWSAPI_KEY}&pageSize=20`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.articles && data.articles.length > 0) {
    const negativeKeywords = ['drone', 'camera', 'laptop', 'phone', 'bike', 'scooter', 'shipping', 'aliexpress', 'amazon', 'monitor', 'keyboard', 'mouse', 'cpu', 'gpu', 'soundbar', 'subwoofer', 'bundle', 'save % off', 'deal', 'price', 'discount'];
    const positiveGamingKeywords = ['game', 'playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'rpg', 'mmo', 'fps', 'trailer', 'review', 'patch', 'update', 'dlc', 'steam', 'epic', 'multiplayer', 'singleplayer', 'battle royale', 'remake', 'remaster', 'esports', 'pokémon', 'zelda', 'elden', 'halo', 'cod', 'gta'];

    const filteredArticles = data.articles.filter(a => {
      const title = a.title.toLowerCase();
      const hasNegative = negativeKeywords.some(word => title.includes(word));
      const hasPositive = positiveGamingKeywords.some(word => title.includes(word));
      return !hasNegative && hasPositive;
    });

    if (filteredArticles.length === 0) {
      console.log("All articles were filtered out by V2 strict logic.");
      return;
    }

    const articlesToInsert = filteredArticles.map(a => ({
      title: a.title,
      slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000),
      content: a.description || "No description",
      source_url: a.url,
      image_url: a.urlToImage,
      category: 'game',
      source_id: 'd31c1e60-acd7-42a6-b1a0-d6671f0fb472',
      published_at: a.publishedAt
    }));

    await supabase.from('news_article').insert(articlesToInsert);
    console.log(`Successfully ingested ${articlesToInsert.length} ULTRA-STRICT gaming articles.`);
  } else {
    console.log("No articles found.");
  }
}

ingestStrictGameNewsV2();
