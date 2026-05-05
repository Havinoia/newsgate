import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { newsArticles } from "@/db/schema";
import { sql } from "drizzle-orm";

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

        // 2. Gunakan Transaction agar proses insert multi-data berjalan atomik
        const result = await db.transaction(async (tx) => {
            let insertedCount = 0;
            let updatedCount = 0;

            for (const article of incomingArticles) {
                // Generate UUID baru atau biarkan Drizzle/Postgres menangani jika ada default
                const id = crypto.randomUUID(); 

                // 3. Upsert Logic (Deduplikasi berdasarkan sourceUrl)
                const upsertResult = await tx.insert(newsArticles).values({
                    id,
                    title: article.title,
                    slug: article.slug,
                    content: article.content,
                    sourceUrl: article.sourceUrl,
                    imageUrl: article.imageUrl,
                    category: article.category,
                    sourceId: article.sourceId,
                    publishedAt: new Date(article.publishedAt),
                    sentimentScore: Math.floor(Math.random() * 100), // Dummy sentiment
                })
                .onConflictDoUpdate({
                    target: newsArticles.sourceUrl, // Konflik di URL yang unik
                    set: {
                        title: article.title,
                        content: article.content,
                        imageUrl: article.imageUrl,
                        // updatedAt: sql`NOW()`, // Jika ada kolom updatedAt
                    }
                }).returning({ id: newsArticles.id });

                if (upsertResult.length > 0) {
                    insertedCount++; // Asumsi sukses (bisa lebih detail mendeteksi insert/update)
                }
            }

            return { insertedCount, updatedCount };
        });

        return NextResponse.json({ 
            success: true, 
            message: `Ingestion complete. Processed ${result.insertedCount} articles.` 
        });

    } catch (error) {
        console.error("Ingestion Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
