import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INGESTION_SECRET = process.env.INGESTION_SECRET;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const APP_URL = 'http://localhost:3000'; // Sesuaikan jika berjalan di port lain

if (!SUPABASE_URL || !SUPABASE_KEY || !INGESTION_SECRET || !NEWSAPI_KEY) {
    console.error("Missing environment variables. Make sure .env.local has NEWSAPI_KEY configured.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// NewsAPI Categories: business, entertainment, general, health, science, sports, technology
// English Mapping:
const CATEGORY_MAP: Record<string, string> = {
    'technology': 'technology',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'business': 'business',
    'health': 'health',
    'general': 'politics',
    'game': 'game'
};

const NEWS_API_CATEGORIES = Object.keys(CATEGORY_MAP);

async function fetchFromNewsAPI(category: string, sourceId: string) {
    console.log(`🌐 Fetching real news from NewsAPI.org for category: ${category}...`);
    
    let url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWSAPI_KEY}&pageSize=5`;
    
    // Khusus untuk Game, kita gunakan Sumber Terpercaya (IGN, Polygon) dengan filter sangat ketat
    if (category === 'game') {
        url = `https://newsapi.org/v2/everything?sources=ign,polygon&q=(gaming OR "video games" OR PlayStation OR Nintendo OR Xbox) -drone -camera -laptop -phone -Ryzen -Intel -bike -scooter -deal -sale -shipping&sortBy=publishedAt&language=en&apiKey=${NEWSAPI_KEY}&pageSize=10`;
    } else if (category === 'general') {
        url = `https://newsapi.org/v2/top-headlines?country=us&category=general&apiKey=${NEWSAPI_KEY}&pageSize=5`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`NewsAPI Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
        return [];
    }

    // Strict Filter Logic untuk memastikan berita murni Game
    const negativeKeywords = [
        'drone', 'camera', 'laptop', 'phone', 'bike', 'scooter', 'shipping', 'aliexpress', 'amazon', 
        'monitor', 'keyboard', 'mouse', 'cpu', 'gpu', 'soundbar', 'subwoofer', 'bundle', 'save % off', 
        'deal', 'price', 'discount', 'ssd', 'headset', 'earbuds', 'watch'
    ];

    const positiveGamingKeywords = [
        'game', 'playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'rpg', 'mmo', 'fps', 'trailer', 
        'review', 'patch', 'update', 'dlc', 'steam', 'epic', 'multiplayer', 'singleplayer', 'battle royale',
        'remake', 'remaster', 'esports', 'stardew', 'pokémon', 'zelda', 'elden', 'halo', 'cod', 'gta'
    ];

    // Map NewsAPI structure to our FetchedArticle interface
    return data.articles
        .filter((article: any) => {
            if (!article.title || !article.url || article.url === 'https://removed.com') return false;
            
            const titleLower = article.title.toLowerCase();
            
            // 1. Cek Kata Kunci Negatif (Hardware/Deals)
            const hasNegative = negativeKeywords.some(word => titleLower.includes(word));
            if (hasNegative) return false;

            // 2. Cek Kata Kunci Positif (Wajib ada nuansa Gaming)
            // Jika kategori adalah 'game', kita wajibkan ada kata kunci gaming di judul
            if (category === 'game') {
                const hasPositive = positiveGamingKeywords.some(word => titleLower.includes(word));
                if (!hasPositive) return false;
            }

            return true;
        })
        .map((article: any) => {
            const safeTitle = article.title.split(' - ')[0]; // Remove source name from title
            const slug = safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);
            
            return {
                title: safeTitle,
                slug: slug,
                content: article.description || article.content || "No description available.",
                sourceUrl: article.url,
                imageUrl: article.urlToImage || `https://picsum.photos/seed/${slug}/800/400`, // Fallback image
                category: CATEGORY_MAP[category],
                sourceId: sourceId,
                publishedAt: article.publishedAt
            };
        });
}

async function startWorker() {
    console.log("🚀 Starting NewsAPI Real-Time Ingestion Worker...");

    // 1. Pastikan minimal ada 1 sumber berita (news_source)
    let { data: sources, error: sourceError } = await supabase.from('news_source').select('id').limit(1);
    
    let sourceId: string;
    
    if (sourceError || !sources || sources.length === 0) {
        console.log("⚠️ No news sources found. Creating a default source...");
        const { data: newSource, error: insertError } = await supabase
            .from('news_source')
            .insert([{ name: 'NewsGate System', icon_url: 'https://ui-avatars.com/api/?name=NG&background=random' }])
            .select()
            .single();
            
        if (insertError) {
            console.error("❌ Failed to create default source:", insertError);
            return;
        }
        sourceId = newSource.id;
    } else {
        sourceId = sources[0].id;
    }

    console.log(`✅ Ready to ingest using Source ID: ${sourceId}`);
    console.log("⏳ Worker is running. Fetching real news every 10 minutes to save API limits...\n");

    const runIngestionCycle = async () => {
        try {
            // Pilih satu kategori secara acak agar adil setiap kali jalan
            const randomCategory = NEWS_API_CATEGORIES[Math.floor(Math.random() * NEWS_API_CATEGORIES.length)];
            
            const articles = await fetchFromNewsAPI(randomCategory, sourceId);
            
            if (articles.length === 0) {
                console.log(`⚠️ No new articles found for category: ${randomCategory}`);
                return;
            }

            console.log(`📡 Ingesting ${articles.length} real articles into database...`);

            const response = await fetch(`${APP_URL}/api/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${INGESTION_SECRET}`
                },
                body: JSON.stringify({ articles })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`HTTP Error ${response.status}: ${errText}`);
            }

            const data = await response.json();
            console.log(`✅ Success: ${data.message}\n`);
            
        } catch (error) {
            console.error("❌ Ingestion Request Failed:", error);
        }
    };

    // Jalankan segera ketika script dimulai
    await runIngestionCycle();

    // Loop interval setiap 10 menit (600.000 ms)
    setInterval(runIngestionCycle, 600000);
}

startWorker();
