import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverEnv } from "@/lib/server-env";
import { DeterministicAskDraftProvider } from "@/lib/providers/mock";

const inputSchema = z.object({
  text: z.string().trim().min(10).max(2500),
  locale: z.string().default("en-US"),
});

export async function POST(request: NextRequest) {
  if (serverEnv.AI_DRAFTS_ENABLED !== "true") {
    return NextResponse.json(
      { error: "AI drafting is disabled. Use the deterministic manual form." },
      { status: 503 },
    );
  }
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );

  // Replace with the OpenAI adapter only after Task 07, evaluation, privacy, and spend gates.
  const result = await new DeterministicAskDraftProvider().draft(parsed.data);
  return NextResponse.json({ draft: result, requiresHumanConfirmation: true });
}
