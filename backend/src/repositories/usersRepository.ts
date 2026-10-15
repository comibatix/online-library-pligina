import { supabase } from '../utils/supabase';

export const findUserByLogin = async (login: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('login', login)
    .single();
  if (error) return null;
  return data;
};

export const createUser = async (login: string, passwordHash: string) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ login, password_hash: passwordHash }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const findUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

export const updateUserLogin = async (userId: string, newLogin: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ login: newLogin })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateUserPassword = async (userId: string, newPasswordHash: string) => {
  const { error } = await supabase
    .from('users')
    .update({ password_hash: newPasswordHash })
    .eq('id', userId);
  if (error) throw error;
};