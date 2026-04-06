import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  createSubscription,
  generateStreakCoupon,
  logUsage,
  updateProfile,
  updateSubscriptionStatus,
  upsertProduct,
} from "@/integrations/supabase/mutations";
import { getAdminOrders, getAdminUsers, getOrders, getRewardProgress, getSubscriptions } from "@/integrations/supabase/queries";

export function useOrderHistory(userId?: string) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => getOrders(userId!),
    enabled: Boolean(userId),
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
    },
  });
}

export function useSubscriptions(userId?: string) {
  return useQuery({
    queryKey: ["subscriptions", userId],
    queryFn: () => getSubscriptions(userId!),
    enabled: Boolean(userId),
  });
}

export function useRewardProgress(userId?: string) {
  return useQuery({
    queryKey: ["reward-progress", userId],
    queryFn: () => getRewardProgress(userId!),
    enabled: Boolean(userId),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubscription,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", variables.userId] });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, status }: { subscriptionId: string; status: string }) =>
      updateSubscriptionStatus(subscriptionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });
}

export function useUpsertProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", data.id] });
    },
  });
}

export function useLogUsage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logUsage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reward-progress", variables.userId] });
    },
  });
}

export function useGenerateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateStreakCoupon,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["reward-progress", userId] });
    },
  });
}
