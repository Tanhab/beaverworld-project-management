import { createClient } from "@/lib/supabase/client";
import type { Profile, UpdateProfileInput } from "@/lib/types/database";
import { logger } from "../logger";

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ avatar_url: string }> {
  const supabase = createClient();

  // Upload new avatar with timestamp to avoid caching issues
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const fileName = `${userId}_${timestamp}.${fileExt}`;
  const filePath = `profiles/${fileName}`;

  // Simple upload without RLS-triggering options
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("user-content")
    .upload(filePath, file);

  if (uploadError) {
    logger.error("Error uploading avatar:", uploadError);
    throw uploadError;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("user-content").getPublicUrl(filePath);

  // Update profile with new avatar URL using the updateProfileFields function
  // This will use the proper RLS context
  await updateProfileFields(userId, { avatar_url: publicUrl } as any);

  return { avatar_url: publicUrl };
}

/**
 * Delete avatar from storage and profile
 */
export async function deleteAvatar(userId: string): Promise<void> {
  const supabase = createClient();

  // Get current avatar URL
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  if (profile?.avatar_url) {
    const urlParts = profile.avatar_url.split("/");
    const oldPath = `profiles/${urlParts[urlParts.length - 1]}`;
    await supabase.storage.from("user-content").remove([oldPath]);
  }

  // Update profile to remove avatar URL
  await updateProfileFields(userId, { avatar_url: null } as any);
}

/**
 * Update profile fields (username, initials, avatar_url)
 */
export async function updateProfileFields(
  userId: string,
  updates: { username?: string; initials?: string; avatar_url?: string }
): Promise<Profile> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    logger.error("Error updating profile:", error);
    throw error;
  }

  return data;
}

/**
 * Change user password
 */
export async function changePassword(newPassword: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    logger.error("Error changing password:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/profile/change-password`,
  });

  if (error) {
    logger.error("Error sending reset email:", error);
    throw error;
  }
}