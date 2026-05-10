const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function ingestStrictGameNews() {
  console.log("Fetching STRICT gaming news (excluding hardware/gadgets)...");
  
  // Menggunakan operator NOT (-) untuk mengecualikan drone, kamera, laptop, dsb.
  const query = `(gaming OR "video games" OR PlayStation OR Nintendo OR Xbox) -drone -camera -laptop -phone -hardware -Ryzen -Intel`;
  const url = `https://newsapi.org/v2/everything?sources=ign,polygon&q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWSAPI_KEY}&pageSize=12`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.articles && data.articles.length > 0) {
    // Filter tambahan di sisi JS untuk memastikan judul mengandung kata terkait game
    const gameKeywords = ['game', 'playstation', 'xbox', 'nintendo', 'switch', 'rpg', 'fps', 'mmo', 'trailer', 'review', 'patch', 'update', 'dlc', 'steam', 'epic'];
    
    const filteredArticles = data.articles.filter(a => {
      const title = a.title.toLowerCase();
      // Pastikan bukan tentang hardware/promo gadget
      const isGadget = title.includes('drone') || title.includes('camera') || title.includes('laptop') || title.includes('ryzen') || title.includes('intel');
      return !isGadget;
    });

    if (filteredArticles.length === 0) {
      console.log("All articles were filtered out.");
      return;
    }

    await supabase.from('news_article').delete().eq('category', 'game');

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
    console.log(`Successfully ingested ${articlesToInsert.length} STRICT gaming articles.`);
  } else {
    console.log("No articles found.");
  }
}

ingestStrictGameNews();
