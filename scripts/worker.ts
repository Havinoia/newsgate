import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INGESTION_SECRET = process.env.INGESTION_SECRET;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const APP_URL = 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_KEY || !INGESTION_SECRET) {
    console.error("Missing critical environment variables.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// STRATEGI QUERY KETAT NEWSAPI
const EXCLUDE_NOISE = '-sports -football -soccer -coach -manager -match -celebrity -movie -film -music -entertainment -hollywood -nba -nfl -fifa -tennis -basketball -lottery -draft -playoffs';

const QUERIES = {
    crypto: `(cryptocurrency OR blockchain OR bitcoin OR ethereum OR "digital assets") -scam -giveaway ${EXCLUDE_NOISE}`,
    politics: `(geopolitics OR legislation OR parliament OR "foreign policy" OR "white house" OR "national security") ${EXCLUDE_NOISE}`,
    energy: `(energy OR "renewable energy" OR "oil and gas" OR "nuclear power" OR "energy market") -car -vehicle -automotive ${EXCLUDE_NOISE}`,
    all: `((cryptocurrency OR blockchain) OR (geopolitics OR legislation) OR (energy OR "oil and gas")) -scam -car -vehicle ${EXCLUDE_NOISE}`
};

function calculateLocalImpact(title: string, content: string): number {
    const text = (title + " " + content).toLowerCase();
    let score = Math.floor(Math.random() * 15) + 35; // Base 35-50

    const highImpactTerms = ['sec', 'fed', 'etf', 'approved', 'hack', 'exploit', 'opec', 'oil spike', 'crash', 'regulation', 'lawsuit', 'bankruptcy', 'sanctions', 'conflict'];
    const midImpactTerms = ['bitcoin', 'btc', 'eth', 'market', 'surge', 'dip', 'partnership', 'launch', 'investment', 'policy'];

    highImpactTerms.forEach(term => {
        if (text.includes(term)) score += 35;
    });

    midImpactTerms.forEach(term => {
        if (text.includes(term)) score += 10;
    });

    return Math.min(score, 99);
}

async function fetchFromNewsAPIStrict(categoryKey: keyof typeof QUERIES) {
    if (!NEWSAPI_KEY) {
        console.log("⚠️ NewsAPI Key missing.");
        return [];
    }

    console.log(`🌐 [NewsAPI Strict] Fetching intelligence for: ${categoryKey.toUpperCase()}...`);
    
    // Gunakan endpoint 'everything' untuk kontrol query yang maksimal
    const query = QUERIES[categoryKey];
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${NEWSAPI_KEY}&pageSize=15`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'error') {
            console.error(`❌ NewsAPI Error (${categoryKey}):`, data.message);
            return [];
        }

        if (!data.articles) return [];

        return data.articles
            .filter((a: any) => {
                if (!a.title || !a.url || a.url === 'https://removed.com' || !a.description) return false;
                
                const contentText = (a.title + " " + (a.description || "")).toLowerCase();
                
                // 1. Filter out broken JSON/System error content
                if (contentText.includes('{"en":') || contentText.includes('access_disabled')) return false;
                
                // 2. Strict Noise Filter (Global)
                const hardExcludes = ['nba', 'lottery', 'draft', 'playoffs', 'lebron', 'curry', 'lakers', 'match', 'score', 'stadium', 'olympics', 'hollywood', 'celebrity'];
                if (hardExcludes.some(word => contentText.includes(word))) return false;

                // 3. Category Guard: Berita HARUS relevan dengan kategorinya
                const categoryKeywords: Record<string, string[]> = {
                    crypto: ['bitcoin', 'btc', 'eth', 'ethereum', 'crypto', 'blockchain', 'wallet', 'exchange', 'token', 'sec', 'binance', 'coinbase'],
                    politics: ['government', 'policy', 'legislation', 'parliament', 'election', 'treaty', 'sanctions', 'white house', 'biden', 'trump', 'minister', 'diplomatic', 'nato', 'un'],
                    energy: ['oil', 'gas', 'crude', 'petroleum', 'renewable', 'solar', 'wind', 'nuclear', 'opec', 'energy', 'refinery', 'drilling']
                };

                const currentKey = categoryKey === 'all' ? null : categoryKey;
                if (currentKey && categoryKeywords[currentKey]) {
                    const hasMatch = categoryKeywords[currentKey].some(word => contentText.includes(word));
                    if (!hasMatch) return false; // Buang jika tidak ada kata kunci kategori
                }

                return true;
            })
            .map((a: any) => {
                const impactScore = calculateLocalImpact(a.title, a.description || a.content || "");
                
                // Determinasi kategori berdasarkan konten jika ini adalah fetch 'all'
                let finalCategory = categoryKey === 'all' ? 'politics' : categoryKey;
                if (categoryKey === 'all') {
                    const text = (a.title + " " + a.description).toLowerCase();
                    if (text.includes('crypto') || text.includes('bitcoin') || text.includes('blockchain')) finalCategory = 'crypto';
                    else if (text.includes('energy') || text.includes('oil') || text.includes('gas')) finalCategory = 'energy';
                }

                return {
                    title: a.title.split(' - ')[0],
                    slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '-' + Math.floor(Math.random() * 1000),
                    content: a.description || a.content || "Deep dive analysis provided via NewsGate Global Intelligence Network.",
                    sourceUrl: a.url,
                    imageUrl: a.urlToImage || `https://picsum.photos/seed/${Math.random()}/800/400`,
                    category: finalCategory,
                    sourceId: a.source?.name || 'newsapi',
                    publishedAt: a.publishedAt,
                    sentimentScore: impactScore
                };
            });
    } catch (e) {
        console.error(`❌ Fetch Error (${categoryKey}):`, e);
        return [];
    }
}

async function startWorker() {
    console.log("🚀 NewsGate STRICT NewsAPI Ingestion Worker Started...");

    const runCycle = async () => {
        // Siklus pengambilan data: Secara bergantian mengambil kategori spesifik atau 'all'
        // Untuk memastikan variasi, kita ambil kategori acak tiap siklus
        const taskList: (keyof typeof QUERIES)[] = ['crypto', 'politics', 'energy', 'all'];
        const currentTask = taskList[Math.floor(Math.random() * taskList.length)];
        
        const articles = await fetchFromNewsAPIStrict(currentTask);

        if (articles.length > 0) {
            console.log(`📡 Ingesting ${articles.length} STRICT articles from NewsAPI [Task: ${currentTask}]...`);
            await fetch(`${APP_URL}/api/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${INGESTION_SECRET}`
                },
                body: JSON.stringify({ articles })
            });
        }
    };

    await runCycle();
    setInterval(runCycle, 600000); // 10 menit sekali
}

startWorker();
