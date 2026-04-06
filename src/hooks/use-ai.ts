import { useMutation } from "@tanstack/react-query";
import { askGemini, generateBundleSuggestion } from "@/integrations/gemini/client";

export function useBundleSuggestion() {
  return useMutation({
    mutationFn: generateBundleSuggestion,
  });
}

export function useAiChat() {
  return useMutation({
    mutationFn: askGemini,
  });
}
