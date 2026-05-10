const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixGameNewsRefined() {
  console.log("Cleaning up old broad game news...");
  await supabase.from('news_article').delete().eq('category', 'game');

  // Menggunakan qInTitle agar lebih akurat (mencari kata kunci di Judul saja)
  const query = `(gaming OR "video games" OR Nintendo OR PlayStation OR Xbox OR "PC games" OR "mobile games")`;
  const url = `https://newsapi.org/v2/everything?qInTitle=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWSAPI_KEY}&pageSize=12`;

  console.log("Fetching highly relevant gaming news (Title Only)...");
  const res = await fetch(url);
  const data = await res.json();

  if (data.articles && data.articles.length > 0) {
    const articles = data.articles.map(a => ({
      title: a.title,
      slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000),
      content: a.description || "No description",
      source_url: a.url,
      image_url: a.urlToImage,
      category: 'game',
      source_id: 'd31c1e60-acd7-42a6-b1a0-d6671f0fb472',
      published_at: a.publishedAt
    }));

    await supabase.from('news_article').insert(articles);
    console.log(`Successfully ingested ${articles.length} highly relevant gaming articles.`);
  } else {
    console.log("No articles found for the query.");
  }
}

fixGameNewsRefined();
