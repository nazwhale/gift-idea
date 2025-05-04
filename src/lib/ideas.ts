// src/lib/ideas.ts
import { supabase } from "./supabaseClient";

export async function getAllIdeas() {
  const { data, error } = await supabase.from("ideas").select(`
      *, 
      giftees (id, name, date_of_birth)  -- Fetch related giftee details
    `);
  if (error) throw error;
  return data;
}

export async function getIdeasForGiftee(gifteeId: string) {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("giftee_id", gifteeId);
  if (error) throw error;
  return data;
}

export async function addIdea(gifteeId: string, name: string) {
  const { data, error } = await supabase
    .from("ideas")
    .insert({ giftee_id: gifteeId, name })
    .select("*");
  if (error) throw error;
  return data[0];
}

export async function updateIdea(id: string, updates: Partial<any>) {
  const { data, error } = await supabase
    .from("ideas")
    .update(updates)
    .eq("id", id)
    .select("*");
  if (error) throw error;
  return data[0];
}

export async function deleteIdea(id: string) {
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) throw error;
}
