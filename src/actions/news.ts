"use server";

import { db } from "@/db/db";
import { newsArticles, sources } from "@/db/schema";
import { desc, eq, and, gte, ilike } from "drizzle-orm";

interface GetArticlesParams {
    query?: string;
    category?: string;
    timeRange?: string; // e.g. "last-6-hours", "last-24-hours", "all"
    limit?: number;
}

export async function getNewsArticles(params: GetArticlesParams) {
    const { query, category, timeRange, limit = 20 } = params;
    
    // Inisialisasi array kondisi/filter Drizzle
    const conditions = [];

    // Filter Kategori
    if (category && category !== "all") {
        conditions.push(eq(newsArticles.category, category));
    }

    // Filter Search/Query (Pencarian pada judul atau konten)
    if (query) {
        conditions.push(ilike(newsArticles.title, `%${query}%`));
    }

    // Filter Waktu
    if (timeRange && timeRange !== "all") {
        const now = new Date();
        let pastDate = new Date();
        
        switch (timeRange) {
            case "last-6-hours":
                pastDate.setHours(now.getHours() - 6);
                break;
            case "last-24-hours":
                pastDate.setHours(now.getHours() - 24);
                break;
            case "last-7-days":
                pastDate.setDate(now.getDate() - 7);
                break;
        }
        
        conditions.push(gte(newsArticles.publishedAt, pastDate));
    }

    // Eksekusi Drizzle Query
    try {
        const articles = await db.query.newsArticles.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [desc(newsArticles.publishedAt)],
            limit: limit,
            with: {
                source: true, // Join tabel sumber (icon & nama sumber)
            }
        });

        return { success: true, data: articles };
    } catch (error) {
        console.error("Failed to fetch articles:", error);
        return { success: false, error: "Gagal mengambil data berita." };
    }
}
