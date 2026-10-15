import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Получаем URL и ключ из .env
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Создаём клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);