function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export const env = {
  get mongodbUri() {
    return required("MONGODB_URI");
  },
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseKey() {
    return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  },
  get groqApiKey() {
    return optional("GROQ_API_KEY");
  },
  get groqModel() {
    return optional("GROQ_MODEL") || "openai/gpt-oss-20b";
  },
  get xaiApiKey() {
    return optional("XAI_API_KEY") ?? optional("GROK_API_KEY");
  },
  get grokModel() {
    return optional("GROK_MODEL") || "grok-4.7";
  },
};
