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

        // Prepare data for upsert
        const articlesToUpsert = incomingArticles.map((article) => ({
            id: crypto.randomUUID(),
            title: article.title,
            slug: article.slug,
            content: article.content,
            source_url: article.sourceUrl, // Maps to source_url in DB
            image_url: article.imageUrl,
            category: article.category,
            source_id: article.sourceId,
            published_at: new Date(article.publishedAt).toISOString(),
            sentiment_score: Math.floor(Math.random() * 100),
        }));

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
