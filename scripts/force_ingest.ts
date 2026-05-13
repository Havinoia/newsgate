import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INGESTION_SECRET = process.env.INGESTION_SECRET;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const APP_URL = 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_KEY || !INGESTION_SECRET || !NEWSAPI_KEY) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORY_MAP: Record<string, string> = {
    'energy': 'energy',
    'crypto': 'crypto'
};

const NEGATIVE_KEYWORDS = [
    'car', 'vehicle', 'automotive', 'suv', 'sedan', 'truck', 'toyota', 'tesla', 'ford', 'ev', 'electric vehicle', 
    'hybrid', 'dealership', 'auto show', 'driving', 'gasoline price at pump'
];

async function fetchFromNewsAPI(category: string, sourceId: string) {
    console.log(`🌐 Fetching news for: ${category}...`);
    let url = '';
    
    if (category === 'crypto') {
        url = `https://newsapi.org/v2/everything?q=(bitcoin OR ethereum OR crypto OR blockchain OR binance OR coinbase) -scam -giveaway&sortBy=publishedAt&language=en&apiKey=${NEWSAPI_KEY}&pageSize=20`;
    } else if (category === 'energy') {
        url = `https://newsapi.org/v2/everything?q=("crude oil" OR "natural gas" OR OPEC OR "energy market" OR "petroleum industry" OR "drilling rig") -car -vehicle -automotive -EV&sortBy=publishedAt&language=en&apiKey=${NEWSAPI_KEY}&pageSize=20`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.articles) return [];

    return data.articles
        .filter((article: any) => {
            if (!article.title || !article.url || article.url === 'https://removed.com') return false;
            const titleLower = article.title.toLowerCase();
            return !NEGATIVE_KEYWORDS.some(kw => titleLower.includes(kw));
        })
        .map((article: any) => {
            const safeTitle = article.title.split(' - ')[0];
            const slug = safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);
            return {
                title: safeTitle,
                slug: slug,
                content: article.description || article.content || "No description available.",
                sourceUrl: article.url,
                imageUrl: article.urlToImage || `https://picsum.photos/seed/${slug}/800/400`,
                category: CATEGORY_MAP[category],
                sourceId: sourceId,
                publishedAt: article.publishedAt
            };
        });
}

async function runForceIngest() {
    console.log("🚀 Forced Ingestion Started with STRICT filtering...");

    let { data: sources } = await supabase.from('news_source').select('id').limit(1);
    const sourceId = sources?.[0]?.id;

    if (!sourceId) return;

    for (const category of ['crypto', 'energy']) {
        try {
            const articles = await fetchFromNewsAPI(category, sourceId);
            if (articles.length === 0) continue;

            const response = await fetch(`${APP_URL}/api/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${INGESTION_SECRET}`
                },
                body: JSON.stringify({ articles })
            });

            if (response.ok) {
                console.log(`✅ Success ingesting ${articles.length} STRICT articles for ${category}`);
            }
        } catch (e) {
            console.error(e);
        }
    }
}

runForceIngest();
