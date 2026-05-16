import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Secret untuk memproteksi route (hanya bisa dipanggil via cron job atau webhook internal)
const INGESTION_SECRET = process.env.INGESTION_SECRET;

interface FetchedArticle {
    title: string;
    slug: string;
    content: string;
    sourceUrl: string;
    imageUrl: string;
    category: string;
    sourceId: string;
    publishedAt: Date;
}

export async function POST(req: Request) {
    try {
        // 1. Verifikasi Secret Key
        const authHeader = req.headers.get("Authorization");
        if (authHeader !== `Bearer ${INGESTION_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const incomingArticles: FetchedArticle[] = body.articles || [];

        if (incomingArticles.length === 0) {
             return NextResponse.json({ message: "No articles provided" });
        }

        // Initialize Supabase admin client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseServiceRoleKey) {
            console.error("Missing Supabase environment variables.");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1.5 Resolve Sources
        // Map source names/IDs to actual source UUIDs
        const uniqueSourceIdentifiers = Array.from(new Set(incomingArticles.map(a => a.sourceId)));
        const sourceMap: Record<string, string> = {};

        for (const identifier of uniqueSourceIdentifiers) {
            // Check if identifier is already a valid UUID
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
            
            if (isUUID) {
                sourceMap[identifier] = identifier;
                continue;
            }

            // Try to find existing source by name
            const { data: existingSource } = await supabase
                .from('news_source')
                .select('id')
                .eq('name', identifier)
                .maybeSingle();

            if (existingSource) {
                sourceMap[identifier] = existingSource.id;
            } else {
                // Create new source if not found
                const { data: newSource, error: createError } = await supabase
                    .from('news_source')
                    .insert({ 
                        name: identifier,
                        icon_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=random`
                    })
                    .select('id')
                    .single();

                if (newSource) {
                    sourceMap[identifier] = newSource.id;
                } else {
                    console.error(`Failed to resolve source: ${identifier}`, createError);
                }
            }
        }

        // Prepare data for upsert
        const articlesToUpsert = incomingArticles.map((article: any) => {
            const text = (article.title + " " + (article.content || "")).toLowerCase();
            
            // Use incoming sentimentScore if available (from CryptoPanic), otherwise calculate
            let impactScore = article.sentimentScore;

            if (impactScore === undefined || impactScore === null) {
                impactScore = Math.floor(Math.random() * 20) + 30; // Base score 30-50

                // Impact weights for keywords
                const criticalTerms = ['sec', 'fed', 'etf', 'hack', 'exploit', 'regulation', 'lawsuit', 'approved'];
                const moderateTerms = ['opec', 'oil', 'gas', 'market', 'bitcoin', 'btc', 'eth', 'price surge', 'crash', 'conflict', 'sanctions'];
                
                criticalTerms.forEach(term => {
                    if (text.includes(term)) impactScore += 45; 
                });

                moderateTerms.forEach(term => {
                    if (text.includes(term)) impactScore += 15;
                });
            }

            return {
                id: crypto.randomUUID(),
                title: article.title,
                slug: article.slug,
                content: article.content,
                source_url: article.sourceUrl,
                image_url: article.imageUrl,
                category: article.category,
                source_id: sourceMap[article.sourceId] || null, // Use resolved UUID
                published_at: new Date(article.publishedAt).toISOString(),
                sentiment_score: Math.min(Math.round(impactScore), 100),
            };
        });

        // 2. Upsert using Supabase
        // onConflict: "source_url" ensures we deduplicate on sourceUrl
        const { data, error } = await supabase
            .from('news_article')
            .upsert(articlesToUpsert, { onConflict: 'source_url' })
            .select();

        if (error) {
            console.error("Supabase Upsert Error:", error);
            throw new Error(error.message);
        }

        return NextResponse.json({ 
            success: true, 
            message: `Ingestion complete. Processed ${data?.length || 0} articles.` 
        });

    } catch (error) {
        console.error("Ingestion Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
