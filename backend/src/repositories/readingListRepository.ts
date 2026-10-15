import { supabase } from '../utils/supabase';

export const getUserReadingList = async (userId: string) => {
  const { data, error } = await supabase
    .from('reading_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const addToReadingList = async (userId: string, bookOlid: string, status: string) => {
  const { data, error } = await supabase
    .from('reading_lists')
    .insert([{ user_id: userId, book_olid: bookOlid, status }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateReadingStatus = async (userId: string, bookOlid: string, status: string) => {
  const { data, error } = await supabase
    .from('reading_lists')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('book_olid', bookOlid)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const removeFromReadingList = async (userId: string, bookOlid: string) => {
  const { error } = await supabase
    .from('reading_lists')
    .delete()
    .eq('user_id', userId)
    .eq('book_olid', bookOlid);
  if (error) throw error;
};

export const isInReadingList = async (userId: string, bookOlid: string) => {
  const { data, error } = await supabase
    .from('reading_lists')
    .select('id')
    .eq('user_id', userId)
    .eq('book_olid', bookOlid)
    .single();
  if (error) return false;
  return !!data;
};