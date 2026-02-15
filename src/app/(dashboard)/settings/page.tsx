"use client";

import { useState, useCallback } from "react";
import { useProfile } from "@/hooks/use-profile";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-page";
import {
  ProfileForm,
  ThemeSettings,
  DataExport,
  DangerZone,
} from "@/components/settings";
import { toast } from "sonner";
import type { ProfileFormValues } from "@/lib/validations/auth";

export default function SettingsPage() {
  const { profile, loading, updateProfile } = useProfile();
  const [formLoading, setFormLoading] = useState(false);

  const handleUpdateProfile = useCallback(async (values: ProfileFormValues) => {
    setFormLoading(true);
    try {
      await updateProfile(values);
      toast.success("Profile updated");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    } finally {
      setFormLoading(false);
    }
  }, [updateProfile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your account and preferences"
        />
        <LoadingPage />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="grid gap-6">
        <ProfileForm
          profile={profile}
          onSubmit={handleUpdateProfile}
          loading={formLoading}
        />

        <ThemeSettings />

        <DataExport />

        <DangerZone />
      </div>
    </div>
  );
}
