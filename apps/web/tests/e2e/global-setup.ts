import { randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type Actor = { email: string; profileId: string; displayName: string };
export type E2EProjectState = {
  circleName: string;
  requester: Actor;
  lender: Actor;
  joiner: Actor;
};
export type E2EState = Record<
  "mobile-chromium" | "desktop-chromium",
  E2EProjectState
>;

const statePath = path.resolve("test-results/e2e-state.json");

function parseEnv(source: string) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator),
          line.slice(separator + 1).replace(/^['"]|['"]$/g, ""),
        ];
      }),
  );
}

async function loadEnvironment() {
  let local: Record<string, string> = {};
  try {
    local = parseEnv(await readFile(".env.local", "utf8"));
  } catch {
    // CI supplies environment variables directly.
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? local.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? local.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export default async function globalSetup() {
  const environment = await loadEnvironment();
  if (!environment.url || !environment.serviceKey) {
    throw new Error("E2E requires Supabase URL and service-role key.");
  }
  const host = new URL(environment.url).hostname;
  if (
    !["127.0.0.1", "localhost"].includes(host) &&
    process.env.E2E_ALLOW_REMOTE_RESET !== "true"
  ) {
    throw new Error(
      "Refusing to seed a remote Supabase project without E2E_ALLOW_REMOTE_RESET=true.",
    );
  }

  const supabase = createClient(environment.url, environment.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const run = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const state = {} as E2EState;

  for (const project of ["mobile-chromium", "desktop-chromium"] as const) {
    const suffix = `${project.startsWith("mobile") ? "m" : "d"}-${run}`;
    const actors = {
      requester: {
        email: `requester-${suffix}@example.test`,
        displayName: "Riley Requester",
      },
      lender: {
        email: `lender-${suffix}@example.test`,
        displayName: "Casey Contributor",
      },
      joiner: {
        email: `joiner-${suffix}@example.test`,
        displayName: "Jamie Joiner",
      },
    };

    const created = {} as Record<keyof typeof actors, Actor>;
    for (const [role, actor] of Object.entries(actors) as Array<
      [keyof typeof actors, (typeof actors)[keyof typeof actors]]
    >) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: actor.email,
        email_confirm: true,
        user_metadata: { display_name: actor.displayName },
      });
      if (error || !data.user) throw error ?? new Error("User seed failed.");
      created[role] = {
        email: actor.email,
        profileId: data.user.id,
        displayName: actor.displayName,
      };
    }

    const circleName =
      project === "mobile-chromium"
        ? `Maple Grove Mobile ${run.slice(-8)}`
        : `Maple Grove Desktop ${run.slice(-8)}`;
    state[project] = {
      circleName,
      requester: created.requester,
      lender: created.lender,
      joiner: created.joiner,
    };
  }

  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify(state, null, 2));
}
