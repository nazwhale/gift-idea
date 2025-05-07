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
  console.log(`Updating idea ${id} with:`, updates);

  const { data, error } = await supabase
    .from("ideas")
    .update(updates)
    .eq("id", id)
    .select("*");

  if (error) {
    console.error("Error updating idea:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.error("No data returned from update");
    throw new Error("No data returned from update");
  }

  // Ensure URL is correctly set in the returned object
  const updatedIdea = data[0];
  console.log("Raw updated idea from DB:", updatedIdea);

  // If URL was in the updates but not in the response, add it explicitly
  if ('url' in updates && updates.url !== undefined && updatedIdea.url === undefined) {
    updatedIdea.url = updates.url;
    console.log("Added missing URL to idea:", updatedIdea);
  }

  return updatedIdea;
}

export async function deleteIdea(id: string) {
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) throw error;
}
