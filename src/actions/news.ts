"use server";

import { createClient } from "@/utils/supabase/server";

interface GetArticlesParams {
    query?: string;
    category?: string;
    timeRange?: string; // e.g. "last-6-hours", "last-24-hours", "all"
    sortBy?: string; // "latest", "impact", "trending"
    limit?: number;
}

export async function getNewsArticles(params: GetArticlesParams) {
    const { query, category, timeRange, sortBy = "latest", limit = 20 } = params;
    
    try {
        const supabase = await createClient();
        
        let dbQuery = supabase
            .from('news_article')
            .select(`
                *,
                source:source_id (
                    id,
                    name,
                    icon_url
                )
            `);

        // Handle Sorting & Filtering
        if (sortBy === "impact") {
            // High Impact is defined as news affecting market > 50%
            dbQuery = dbQuery.gte('sentiment_score', 50)
                             .order('sentiment_score', { ascending: false })
                             .order('published_at', { ascending: false });
        } else if (sortBy === "oldest") {
            // Oldest is ascending chronological
            dbQuery = dbQuery.order('published_at', { ascending: true });
        } else {
            // Latest is pure descending chronological (default)
            dbQuery = dbQuery.order('published_at', { ascending: false });
        }

        dbQuery = dbQuery.limit(limit);

        // Filter Kategori
        if (category && category !== "all") {
            dbQuery = dbQuery.eq('category', category);
        }

        // Broad Search/Query (Search in title or content)
        if (query) {
            dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
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
            
            dbQuery = dbQuery.gte('published_at', pastDate.toISOString());
        }

        const { data, error } = await dbQuery;
        
        if (error) {
            console.error("Supabase Query Error:", error);
            throw new Error(error.message);
        }

        // Map camelCase for frontend compatibility
        const articles = data.map(article => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            sourceUrl: article.source_url,
            imageUrl: article.image_url,
            category: article.category,
            sourceId: article.source_id,
            publishedAt: article.published_at,
            sentimentScore: article.sentiment_score,
            source: Array.isArray(article.source) ? article.source[0] : article.source ? {
                id: (article.source as any).id,
                name: (article.source as any).name,
                iconUrl: (article.source as any).icon_url,
            } : null
        }));

        return { success: true, data: articles };
    } catch (error) {
        console.error("Failed to fetch articles:", error);
        return { success: false, error: "Gagal mengambil data berita." };
    }
}
