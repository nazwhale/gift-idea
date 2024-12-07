// src/lib/ideas.ts
import { supabase } from "./supabaseClient";

export async function getIdeasForGiftee(gifteeId: string) {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("giftee_id", gifteeId);
  if (error) throw error;
  return data;
}

export async function addIdea(
  gifteeId: string,
  name: string,
  description: string
) {
  const { data, error } = await supabase
    .from("ideas")
    .insert({ giftee_id: gifteeId, name, description })
    .select("*");
  if (error) throw error;
  return data[0];
}

export async function updateIdea(
  id: string,
  updates: Partial<{ is_chosen: boolean; rating: number }>
) {
  const { data, error } = await supabase
    .from("ideas")
    .update(updates)
    .eq("id", id)
    .select("*");
  if (error) throw error;
  return data[0];
}
