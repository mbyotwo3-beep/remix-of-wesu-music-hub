import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a File to a private Supabase storage bucket and return the stored path.
 * Path layout: <user_id>/<timestamp>-<safe-name>
 */
export async function uploadFileToBucket(
  bucket: "song-audio" | "album-art" | "artist-images" | "user-avatars",
  userId: string,
  file: File,
): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  return path;
}
