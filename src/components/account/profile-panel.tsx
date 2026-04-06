import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-orders";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/shared/input";
import type { Profile } from "@/types";

interface ProfileFormValues {
  display_name: string;
  avatar_url: string;
  address: string;
}

export function ProfilePanel({ profile }: { profile: Profile }) {
  const { applyProfile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<ProfileFormValues>({
    defaultValues: {
      display_name: profile.display_name ?? "",
      avatar_url: profile.avatar_url ?? "",
      address: profile.address ?? "",
    },
  });
  const updateProfile = useUpdateProfile();
  const avatarUrl = watch("avatar_url");

  useEffect(() => {
    reset({
      display_name: profile.display_name ?? "",
      avatar_url: profile.avatar_url ?? "",
      address: profile.address ?? "",
    });
  }, [profile.address, profile.avatar_url, profile.display_name, reset]);

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValue("avatar_url", reader.result, { shouldDirty: true });
      }
    };
    reader.readAsDataURL(file);
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const savedProfile = await updateProfile.mutateAsync({
        id: profile.id,
        ...values,
      });
      applyProfile(savedProfile);
      await refreshProfile();
      setIsEditing(false);
      reset({
        display_name: savedProfile.display_name ?? "",
        avatar_url: savedProfile.avatar_url ?? "",
        address: savedProfile.address ?? "",
      });
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile.");
    }
  });

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold">Profile</h3>
          <p className="mt-2 text-sm text-muted-foreground">View your profile details or edit them anytime from here.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            {profile.loyalty_points} points
          </div>
          <Button variant="secondary" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? "Cancel" : "Edit profile"}
          </Button>
        </div>
      </div>
      {!isEditing ? (
        <div className="mt-8 grid gap-6 md:grid-cols-[auto,1fr] md:items-start">
          <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-white/5">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name ?? "Profile"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-primary">
                {(profile.display_name?.[0] ?? "A").toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Display name</p>
              <p className="mt-2 text-lg font-medium">{profile.display_name || "Not set yet"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Address</p>
              <p className="mt-2 text-sm text-muted-foreground">{profile.address || "No address added yet"}</p>
            </div>
          </div>
        </div>
      ) : (
        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Input placeholder="Display name" {...register("display_name")} />
          <Input placeholder="Address" {...register("address")} />
          <label className="flex h-11 cursor-pointer items-center rounded-full border border-white/15 bg-white/[0.06] px-4 text-sm text-muted-foreground">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            Upload profile photo
          </label>
          {avatarUrl ? (
            <div className="md:col-span-2">
              <img src={avatarUrl} alt="Avatar preview" className="h-24 w-24 rounded-full border border-white/10 object-cover" />
            </div>
          ) : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
