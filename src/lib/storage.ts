"use client";

import { createClient } from "@/lib/supabase/client";

export async function uploadProductAsset(
  file: File,
  prefix = "uploads",
): Promise<{ path: string; publicUrl: string }> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${prefix}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-assets")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (error) throw error;

  const { data: signed } = await supabase.storage
    .from("product-assets")
    .createSignedUrl(path, 60 * 60 * 24 * 30); // 30d

  return { path, publicUrl: signed?.signedUrl ?? "" };
}
