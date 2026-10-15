import { supabase } from '../utils/supabase';

export const getUserComments = async (userId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, user_id, book_olid, text, created_at, updated_at, users(login)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map((c: any) => ({
    ...c,
    user_login: c.users?.login || 'Неизвестный пользователь'
  }));
};

export const getBookComments = async (bookOlid: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, user_id, book_olid, text, created_at, updated_at, users(login)')
    .eq('book_olid', bookOlid)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map((c: any) => ({
    ...c,
    user_login: c.users?.login || 'Неизвестный пользователь'
  }));
};

export const createComment = async (userId: string, bookOlid: string, text: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ user_id: userId, book_olid: bookOlid, text }])
    .select('id, user_id, book_olid, text, created_at, updated_at, users(login)')
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    user_login: data.users?.login || 'Неизвестный пользователь'
  };
};

export const updateComment = async (commentId: string, userId: string, text: string) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ text, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', userId)
    .select('id, user_id, book_olid, text, created_at, updated_at, users(login)')
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    user_login: data.users?.login || 'Неизвестный пользователь'
  };
};

export const deleteComment = async (commentId: string, userId: string) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);
  
  if (error) throw error;
};

export const findCommentById = async (commentId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single();
  
  if (error) return null;
  return data;
};