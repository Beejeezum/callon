import "server-only";
import { cache } from "react";
import type { Ask, Need } from "@/lib/mock-data";
import { asks as mockAsks, getAsk as getMockAsk } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hashOpaqueToken } from "./tokens";

type NeedRow = {
  id: string;
  title: string;
  kind: Need["kind"];
  quantity_requested: number;
  quantity_committed: number;
};

type AskRow = {
  id: string;
  created_by?: string;
  ask_type: "quick_need" | "project" | "event" | "offer";
  title: string;
  description: string;
  needed_by: string;
  general_location: string;
  cover_image_path: string | null;
  ask_needs: NeedRow[];
};

export type MemberAskProjection = Ask & {
  createdById: string | null;
};

function dateLabel(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function mapAsk(row: AskRow): Ask {
  const needs = row.ask_needs.map((need) => ({
    id: need.id,
    title: need.title,
    quantity: Number(need.quantity_requested),
    committed: Number(need.quantity_committed),
    kind: need.kind,
  }));
  const requested = needs.reduce((sum, need) => sum + need.quantity, 0);
  const committed = needs.reduce(
    (sum, need) => sum + Math.min(need.quantity, need.committed),
    0,
  );
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    label:
      row.ask_type === "event"
        ? "Event"
        : row.ask_type === "offer"
          ? "Offering"
          : "Need help",
    dateLabel: dateLabel(row.needed_by),
    neededBy: row.needed_by,
    generalLocation: row.general_location,
    progress: requested > 0 ? (committed / requested) * 100 : 0,
    image: row.cover_image_path ?? undefined,
    needs,
  };
}

export const getCircleAsks = cache(
  async (circleId: string | null): Promise<Ask[]> => {
    if (!isSupabaseConfigured || !circleId) return mockAsks;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("asks")
      .select(
        "id, ask_type, title, description, needed_by, general_location, cover_image_path",
      )
      .eq("circle_id", circleId)
      .in("status", ["open", "partially_fulfilled", "ready", "in_progress"])
      .order("needed_by", { ascending: true });
    if (error) throw new Error("Unable to load Circle Asks.");
    const ids = (data ?? []).map((row) => row.id);
    const { data: needs, error: needsError } = ids.length
      ? await supabase
          .from("ask_needs")
          .select(
            "id, ask_id, title, kind, quantity_requested, quantity_committed",
          )
          .in("ask_id", ids)
          .order("sort_order")
      : { data: [], error: null };
    if (needsError) throw new Error("Unable to load Ask needs.");
    return (data ?? []).map((row) =>
      mapAsk({
        ...row,
        ask_needs: (needs ?? [])
          .filter((need) => need.ask_id === row.id)
          .map((need) => ({
            id: need.id,
            title: need.title,
            kind: need.kind,
            quantity_requested: need.quantity_requested,
            quantity_committed: need.quantity_committed,
          })),
      }),
    );
  },
);

export const getMemberAsk = cache(
  async (askId: string): Promise<MemberAskProjection | null> => {
    if (!isSupabaseConfigured) {
      const ask = getMockAsk(askId);
      return ask ? { ...ask, createdById: null } : null;
    }
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("asks")
      .select(
        "id, created_by, ask_type, title, description, needed_by, general_location, cover_image_path",
      )
      .eq("id", askId)
      .maybeSingle();
    if (error || !data) return null;
    const { data: needs, error: needsError } = await supabase
      .from("ask_needs")
      .select("id, title, kind, quantity_requested, quantity_committed")
      .eq("ask_id", askId)
      .order("sort_order");
    if (needsError) return null;
    return {
      ...mapAsk({ ...data, ask_needs: needs ?? [] }),
      createdById: data.created_by,
    };
  },
);

export type SharedAskProjection = Ask & {
  circleName: string;
  expiresAt: string;
};

export const getSharedAsk = cache(
  async (token: string): Promise<SharedAskProjection | null> => {
    if (!isSupabaseConfigured) {
      return {
        ...mockAsks[0],
        circleName: "Oakridge HOA",
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      };
    }
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.rpc("get_shared_ask", {
        p_token_hash: hashOpaqueToken(token),
      });
      if (error || !data || typeof data !== "object" || Array.isArray(data)) {
        return null;
      }
      const projection = data as {
        askId: string;
        circleName: string;
        title: string;
        description: string;
        generalLocation: string;
        neededBy: string;
        expiresAt: string;
        coverImagePath?: string | null;
        needs: Array<{
          id: string;
          title: string;
          kind: Need["kind"];
          quantityRequested: number;
          quantityCommitted: number;
        }>;
      };
      const mapped = mapAsk({
        id: projection.askId,
        ask_type: "quick_need",
        title: projection.title,
        description: projection.description,
        needed_by: projection.neededBy,
        general_location: projection.generalLocation,
        cover_image_path: projection.coverImagePath ?? null,
        ask_needs: projection.needs.map((need) => ({
          id: need.id,
          title: need.title,
          kind: need.kind,
          quantity_requested: Number(need.quantityRequested),
          quantity_committed: Number(need.quantityCommitted),
        })),
      });
      return {
        ...mapped,
        circleName: projection.circleName,
        expiresAt: projection.expiresAt,
      };
    } catch {
      return null;
    }
  },
);
