import { env } from "@/config/env";
import { bundles, products } from "@/data/mock-data";
import type { BundlePreferences, BundleSuggestion, Product } from "@/types";

const endpoint =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function buildLocalSuggestion(preferences: BundlePreferences): BundleSuggestion {
  const matchedProducts = products
    .filter((product) => product.goal_tags.includes(preferences.fitnessGoal))
    .sort((a, b) => a.price - b.price)
    .filter((product) => product.price <= preferences.budget)
    .slice(0, preferences.experienceLevel === "advanced" ? 4 : 3);

  const existingBundle = bundles.find((bundle) => bundle.goal === preferences.fitnessGoal);
  const selectedProducts = matchedProducts.length ? matchedProducts : products.slice(0, 3);

  return {
    title: existingBundle?.name ?? "Personalized AthletIQ Bundle",
    description:
      existingBundle?.description ??
      "A tailored stack combining training support, recovery, and essentials aligned to your goals.",
    products: selectedProducts,
    estimatedTotal: selectedProducts.reduce((sum, product) => sum + product.price, 0),
    reason: `Selected for a ${preferences.experienceLevel} athlete with ${preferences.activityLevel} activity targeting ${preferences.fitnessGoal.replace("-", " ")} within budget.`,
    image_url: existingBundle?.image_url ?? selectedProducts[0]?.image_url ?? "",
  };
}

async function geminiRequest(prompt: string) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.geminiApiKey,
    },
    signal: controller.signal,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6 },
    }),
  });
  window.clearTimeout(timeoutId);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Gemini request failed.");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
}

function localChatFallback(question: string) {
  const normalized = question.toLowerCase();
  const compact = normalized.replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
  const matchingProducts = products.filter(
    (product) =>
      normalized.includes(product.name.toLowerCase()) ||
      product.goal_tags.some((goal) => normalized.includes(goal.replace("-", " "))) ||
      product.tags?.some((tag) => normalized.includes(tag.toLowerCase())),
  );

  if (
    compact.includes("whey protein") ||
    compact.includes("what is whey") ||
    compact.includes("what i whey") ||
    compact.includes("whey")
  ) {
    return "Whey protein is a fast-digesting milk-derived protein commonly used to support recovery and daily protein intake. It is popular after workouts because it is convenient, high in essential amino acids, and especially rich in leucine, which helps stimulate muscle protein synthesis.";
  }

  if (normalized.includes("weight loss")) {
    return "For weight loss, start with Vital Greens Complex, Smart Speed Rope, and Hydra Smart Bottle. That gives you daily nutrition support, conditioning, and hydration without overspending.";
  }

  if (normalized.includes("muscle") || normalized.includes("gain")) {
    return "For muscle gain, a strong starter stack is IsoFlex Whey Protein, Creatine Monohydrate, and Adjustable Dumbbell Kit. It covers protein intake, strength progression, and resistance training.";
  }

  if (normalized.includes("home workout")) {
    return "For home workouts, I’d look at Resistance Bands Set, GripFlow Training Mat, and Deep Tissue Foam Roller. It’s a practical setup for training, mobility, and recovery.";
  }

  if (normalized.includes("protein")) {
    return "A simple protein target for many active adults is roughly 1.2 to 2.2 grams per kilogram of body weight per day, depending on training volume, recovery needs, and muscle-building goals.";
  }

  if (normalized.includes("creatine")) {
    return "Creatine monohydrate is commonly used at 3 to 5 grams daily. Consistency matters more than timing for most people, and staying hydrated is a good idea.";
  }

  if (normalized.includes("fat loss") || normalized.includes("lose fat")) {
    return "Fat loss usually works best with a modest calorie deficit, regular strength training, enough protein, daily movement, and sleep consistency. Fast results are less important than habits you can maintain.";
  }

  if (normalized.includes("build muscle") || normalized.includes("hypertrophy")) {
    return "To build muscle, focus on progressive overload, enough weekly training volume, solid protein intake, and recovery. Train major muscle groups consistently and aim to improve reps, load, or quality over time.";
  }

  if (normalized.includes("workout split")) {
    return "A good starting split is 3 full-body sessions per week for beginners, or upper/lower or push-pull-legs for people who train more often. The best split is the one you can recover from and stay consistent with.";
  }

  if (normalized.includes("cardio")) {
    return "Cardio can support heart health, conditioning, and fat loss. For many people, 2 to 4 sessions per week works well alongside strength training, depending on goals and recovery.";
  }

  if (normalized.includes("recovery") || normalized.includes("sore")) {
    return "Recovery basics include sleep, hydration, enough protein, manageable training volume, and light movement. Foam rolling and mobility can help some people feel better, but they are not substitutes for rest.";
  }

  if (normalized.includes("sleep")) {
    return "Sleep is one of the biggest drivers of performance and recovery. A consistent sleep window, reduced late-night stimulation, and a cool, dark room can make a meaningful difference.";
  }

  if (normalized.includes("warm up")) {
    return "A practical warm-up is 5 to 10 minutes of light movement, followed by dynamic mobility and a few lighter sets of the first exercise. It should prepare you, not tire you out.";
  }

  if (normalized.includes("supplement")) {
    return "The most useful supplements for many people are the boring basics: protein if intake is low, creatine for strength and muscle support, and targeted vitamins only when there is a real need.";
  }

  if (normalized.includes("calorie") || normalized.includes("cutting") || normalized.includes("bulking")) {
    return "For cutting, aim for a moderate calorie deficit while keeping protein high and training hard enough to maintain muscle. For bulking, use a small surplus, prioritize progressive overload, and monitor weight gain so it stays controlled.";
  }

  if (normalized.includes("beginner") || normalized.includes("just starting")) {
    return "If you're just starting, focus on 3 full-body workouts per week, basic movement patterns, daily walking, enough protein, and sleep consistency. Start simple and build momentum before chasing complexity.";
  }

  if (normalized.includes("how many days")) {
    return "For most people, 3 to 5 training days per week is enough to make great progress. The right number depends on recovery, schedule, training age, and how hard each session is.";
  }

  if (normalized.includes("meal") || normalized.includes("diet")) {
    return "A practical nutrition setup is to build each meal around protein, add fruit or vegetables, choose a carb source based on activity, and include healthy fats in moderation. Consistency matters more than perfect meal timing for most people.";
  }

  if (normalized.includes("water") || normalized.includes("hydration")) {
    return "Hydration needs vary, but a simple rule is to drink consistently through the day, increase intake around training, and pay attention to heat, sweat loss, and urine color.";
  }

  if (normalized.includes("strength")) {
    return "Strength improves best with repeated practice on key lifts, progressive overload, enough rest between hard sets, and a program you can follow consistently for months rather than days.";
  }

  if (matchingProducts.length > 0) {
    const summary = matchingProducts
      .slice(0, 3)
      .map((product) => `${product.name} (${product.price} INR)`)
      .join(", ");
    return `You may want to look at ${summary}. These match what you asked and are available in the AthletIQ catalog.`;
  }

  return "I can help with product picks, bundle ideas, usage questions, subscriptions, and recovery suggestions. Try asking about weight loss, muscle gain, home workouts, or a specific product.";
}

function buildChatPrompt(question: string, history: Array<{ role: "user" | "assistant"; content: string }>) {
  const recentHistory = history
    .slice(-6)
    .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
    .join("\n");

  return `You are AthletIQ Coach, a smart, practical fitness assistant inside a commerce app.
Your job is to answer almost any general fitness question clearly and intelligently.
You can help with training, workout splits, strength, hypertrophy, fat loss, cardio, recovery, mobility, warm-ups, protein, creatine, supplements, habits, beginner guidance, and product selection.
When a question is broad, give a direct answer first and then 2 to 4 actionable points.
When a question is personal but missing details, make a reasonable assumption and say it briefly.
Do not act like a doctor. For injuries, serious symptoms, eating disorders, medications, or medical conditions, recommend a qualified professional.
Do not be robotic, salesy, or overly cautious.
If relevant, mention AthletIQ products naturally, but only when they genuinely help.
Keep answers concise but useful, usually 4 to 8 sentences.

AthletIQ catalog:
${products.map((product) => `${product.name} - INR ${product.price} - tags: ${(product.tags ?? []).join(", ") || "fitness"} - goals: ${product.goal_tags.join(", ")}`).join("\n")}

Recent conversation:
${recentHistory || "No prior conversation."}

Current user question:
${question}

If the user's wording is short, messy, or misspelled, infer the most likely fitness meaning and answer that directly. For example, if they ask something like "what i whey protein", interpret it as "what is whey protein?" unless context strongly suggests otherwise.`;
}

export async function generateBundleSuggestion(preferences: BundlePreferences): Promise<BundleSuggestion> {
  const fallback = buildLocalSuggestion(preferences);

  if (!env.geminiApiKey) {
    return fallback;
  }

  const prompt = `You are generating a concise fitness bundle recommendation for an Indian e-commerce app.
Goal: ${preferences.fitnessGoal}
Experience: ${preferences.experienceLevel}
Activity: ${preferences.activityLevel}
Budget INR: ${preferences.budget}
Height cm: ${preferences.heightCm}
Weight kg: ${preferences.weightKg}
Available products: ${products.map((product) => `${product.name} - INR ${product.price} - goals ${product.goal_tags.join(",")}`).join(" | ")}
Available bundle images: ${bundles.map((bundle) => `${bundle.name} => ${bundle.image_url}`).join(" | ")}
Return strict JSON with keys: title, description, reason, productNames(array), image_url.`;

  try {
    const text = await geminiRequest(prompt);
    if (!text) return fallback;
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      title?: string;
      description?: string;
      reason?: string;
      productNames?: string[];
      image_url?: string;
    };

    const suggestedProducts =
      parsed.productNames
        ?.map((name) => products.find((product) => product.name.toLowerCase() === name.toLowerCase()))
        .filter((product): product is Product => Boolean(product)) ?? [];

    return {
      title: parsed.title ?? fallback.title,
      description: parsed.description ?? fallback.description,
      reason: parsed.reason ?? fallback.reason,
      products: suggestedProducts.length ? suggestedProducts : fallback.products,
      estimatedTotal: (suggestedProducts.length ? suggestedProducts : fallback.products).reduce(
        (sum, product) => sum + product.price,
        0,
      ),
      image_url: parsed.image_url ?? fallback.image_url,
    };
  } catch {
    return fallback;
  }
}

export async function askGemini(args: {
  question: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const { question, history } = args;

  if (!env.geminiApiKey) {
    return localChatFallback(question);
  }

  try {
    const text = await geminiRequest(buildChatPrompt(question, history));
    return text?.trim() || localChatFallback(question);
  } catch {
    return localChatFallback(question);
  }
}
