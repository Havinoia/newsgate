import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const QUERIES = {
    crypto: '(cryptocurrency OR blockchain OR bitcoin OR ethereum OR "digital assets") -scam -giveaway -sports',
    politics: '(geopolitics OR legislation OR parliament OR "foreign policy" OR "white house" OR "national security") -sports -celebrity',
    energy: '(energy OR "renewable energy" OR "oil and gas" OR "nuclear power" OR "energy market") -car -vehicle -automotive -sports'
};

function calculateLocalImpact(title: string, content: string): number {
    const text = (title + " " + content).toLowerCase();
    let score = Math.floor(Math.random() * 15) + 35;
    const highImpactTerms = ['sec', 'fed', 'etf', 'approved', 'hack', 'exploit', 'opec', 'oil spike', 'crash', 'regulation', 'lawsuit', 'bankruptcy', 'sanctions', 'conflict'];
    highImpactTerms.forEach(term => { if (text.includes(term)) score += 35; });
    return Math.min(score, 99);
}

async function fetchStrict(categoryKey: keyof typeof QUERIES) {
    console.log(`🌐 Fetching: ${categoryKey.toUpperCase()}...`);
    const query = QUERIES[categoryKey];
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${NEWSAPI_KEY}&pageSize=20`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.articles) return [];

        return data.articles
            .filter((a: any) => {
                if (!a.title || !a.url || !a.description) return false;
                const text = (a.title + " " + a.description).toLowerCase();
                if (text.includes('{"en":')) return false;
                
                const categoryKeywords: Record<string, string[]> = {
                    crypto: ['bitcoin', 'btc', 'eth', 'crypto', 'blockchain', 'sec', 'binance', 'wallet', 'market'],
                    politics: ['government', 'policy', 'legislation', 'parliament', 'election', 'white house', 'biden', 'trump', 'nato', 'ukraine', 'russia', 'china'],
                    energy: ['oil', 'gas', 'crude', 'renewable', 'solar', 'wind', 'opec', 'energy', 'power', 'nuclear']
                };

                return categoryKeywords[categoryKey].some(word => text.includes(word));
            })
            .map((a: any) => ({
                id: crypto.randomUUID(),
                title: a.title.split(' - ')[0],
                slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '-' + Math.floor(Math.random() * 1000),
                content: a.description || "Deep dive analysis provided via NewsGate System.",
                source_url: a.url,
                image_url: a.urlToImage || `https://picsum.photos/seed/${Math.random()}/800/400`,
                category: categoryKey,
                source_id: 'd31c1e60-acd7-42a6-b1a0-d6671f0fb472',
                published_at: new Date(a.publishedAt).toISOString(),
                sentiment_score: calculateLocalImpact(a.title, a.description)
            }));
    } catch (e) {
        console.error("Error fetching:", e);
        return [];
    }
}

async function main() {
    console.log("🚀 STARTING DIRECT DATABASE INGESTION...");
    
    const categories: (keyof typeof QUERIES)[] = ['crypto', 'politics', 'energy'];
    let total = 0;

    for (const cat of categories) {
        const articles = await fetchStrict(cat);
        if (articles.length > 0) {
            console.log(`📡 Ingesting ${articles.length} for ${cat} directly to Supabase...`);
            const { error } = await supabase.from('news_article').upsert(articles, { onConflict: 'source_url' });
            
            if (error) {
                console.error(`❌ Error ingesting ${cat}:`, error);
            } else {
                total += articles.length;
            }
        }
    }

    console.log(`✅ COMPLETE. Total ingested in this run: ${total} articles.`);

    // Final verification
    for (const cat of categories) {
        const { count } = await supabase.from('news_article').select('*', { count: 'exact', head: true }).eq('category', cat);
        console.log(`📊 DB STATUS [${cat}]: ${count} articles total.`);
    }
}

main();
