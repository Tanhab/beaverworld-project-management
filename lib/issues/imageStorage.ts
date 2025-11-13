import { createClient } from "@/lib/supabase/client";

/**
 * Upload image to Supabase storage
 * @param file - The image file to upload
 * @param issueId - The issue ID to organize files
 * @returns Public URL of the uploaded image
 */
export async function uploadIssueImage(
  file: File,
  issueId: string
): Promise<string> {
  const supabase = createClient();

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = file.name.split(".").pop() || "jpg";
  const filename = `${timestamp}_${randomString}.${extension}`;

  // Upload path: user-content/issues/{issueId}/{filename}
  const filePath = `issues/${issueId}/${filename}`;

  const { data, error } = await supabase.storage
    .from("user-content")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("user-content").getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Delete image from Supabase storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteIssueImage(imageUrl: string): Promise<void> {
  const supabase = createClient();

  // Extract file path from public URL
  // URL format: https://{project}.supabase.co/storage/v1/object/public/user-content/issues/{issueId}/{filename}
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split("/");
  const bucketIndex = pathParts.indexOf("user-content");
  
  if (bucketIndex === -1) {
    throw new Error("Invalid image URL");
  }

  const filePath = pathParts.slice(bucketIndex + 1).join("/");

  const { error } = await supabase.storage
    .from("user-content")
    .remove([filePath]);

  if (error) {
    console.error("Delete error:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Upload multiple images and save to database
 * @param files - Array of image files
 * @param issueId - The issue ID
 * @returns Array of created image records
 */
export async function uploadAndSaveIssueImages(
  files: File[],
  issueId: string
): Promise<any[]> {
  const supabase = createClient();
  const uploadedImages: any[] = [];

  // Upload each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Upload to storage
      const imageUrl = await uploadIssueImage(file, issueId);
      const {data : {user}} = await supabase.auth.getUser()
      if(!user) throw new Error("User not logged in")
      // Save to database
      const { data, error } = await supabase
        .from("issue_images")
        .insert({
          issue_id: issueId,
          storage_path: imageUrl,
          display_order: i,
          file_size: file.size,
          uploaded_by: user.id,})
        .select()
        .single();

      if (error) throw error;

      uploadedImages.push(data);
    } catch (error) {
      console.error(`Failed to upload image ${i + 1}:`, error);
      // Clean up already uploaded images
      for (const img of uploadedImages) {
        try {
          await deleteIssueImage(img.image_url);
          await supabase.from("issue_images").delete().eq("id", img.id);
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }
      throw error;
    }
  }

  return uploadedImages;
}

/**
 * Delete image record from database and storage
 * @param imageId - The image record ID
 * @param imageUrl - The image URL to delete from storage
 */
export async function deleteIssueImageComplete(
  imageId: string,
  imageUrl: string
): Promise<void> {
  const supabase = createClient();

  // Delete from storage first
  try {
    await deleteIssueImage(imageUrl);
  } catch (error) {
    console.error("Failed to delete from storage:", error);
    // Continue to delete from database even if storage delete fails
  }

  // Delete from database
  const { error } = await supabase
    .from("issue_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    throw new Error(`Failed to delete image record: ${error.message}`);
  }
}