// src/lib/giftees.ts
import { supabase } from "./supabaseClient";

export async function getGiftees() {
  const { data, error } = await supabase.from("giftees").select("*");
  if (error) throw error;
  return data;
}

export async function getGifteeById(gifteeId: string) {
  const { data, error } = await supabase
    .from("giftees")
    .select("*")
    .eq("id", gifteeId)
    .single(); // Use .single() to ensure only one row is returned

  if (error) {
    throw new Error(
      `Failed to fetch giftee with ID ${gifteeId}: ${error.message}`
    );
  }

  return data;
}

export async function addGiftee(name: string) {
  // Fetch the current user
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`Failed to retrieve session: ${sessionError.message}`);
  }

  if (!session || !session.user || !session.user.id) {
    throw new Error("No authenticated user found");
  }

  const userId = session.user.id; // Get the authenticated user's ID

  // Insert the giftee with the user's ID
  const { data, error } = await supabase
    .from("giftees")
    .insert({
      name,
      user_id: userId,
    })
    .select("*");

  if (error) {
    throw new Error(`Failed to add giftee: ${error.message}`);
  }

  return data[0];
}
