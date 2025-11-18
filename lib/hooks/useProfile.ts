import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadAvatar,
  deleteAvatar,
  updateProfileFields,
  changePassword,
  sendPasswordResetEmail,
} from "../api/profile";
import { toast } from "sonner";

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      uploadAvatar(userId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile picture updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload avatar: ${error.message}`);
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteAvatar(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile picture removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove avatar: ${error.message}`);
    },
  });
}

export function useUpdateProfileFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: { username?: string; initials?: string };
    }) => updateProfileFields(userId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", data.id] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (newPassword: string) => changePassword(newPassword),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to change password: ${error.message}`);
    },
  });
}

export function useSendPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => sendPasswordResetEmail(email),
    onSuccess: () => {
      toast.success("Password reset email sent! Check your inbox.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to send reset email: ${error.message}`);
    },
  });
}