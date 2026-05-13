import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanEnergy() {
    console.log("🧹 Cleaning up old energy articles (automotive noise)...");
    const { error } = await supabase
        .from('news_article')
        .delete()
        .eq('category', 'energy');

    if (error) console.error(error);
    else console.log("✅ Cleaned.");
}

cleanEnergy();
