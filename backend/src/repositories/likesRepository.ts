import { supabase } from '../utils/supabase';

export const getUserLikes = async (userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const addLike = async (userId: string, bookOlid: string) => {
  const { data, error } = await supabase
    .from('likes')
    .insert([{ user_id: userId, book_olid: bookOlid }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const removeLike = async (userId: string, bookOlid: string) => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('book_olid', bookOlid);
  if (error) throw error;
};

export const getLikeCount = async (bookOlid: string) => {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('book_olid', bookOlid);
  if (error) throw error;
  return count || 0;
};

export const hasLike = async (userId: string, bookOlid: string) => {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('book_olid', bookOlid)
    .single();
  if (error) return false;
  return !!data;
};