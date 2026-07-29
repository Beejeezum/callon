import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/public-env";
import {
  paseosServiceDirectoryEntries,
  serviceDirectoryCategories,
  type ServiceDirectoryEntry,
} from "@/lib/service-directory";

export type CommunityServiceDirectory = {
  entries: ServiceDirectoryEntry[];
  categories: typeof serviceDirectoryCategories;
  messageCount: number;
  sourceLabel: string;
};

export const getCommunityServiceDirectory = cache(
  async ({
    circleId,
    circleName,
  }: {
    circleId: string | null;
    circleName?: string;
  }): Promise<CommunityServiceDirectory> => {
    const isPaseos =
      !isSupabaseConfigured ||
      !circleId ||
      circleName?.toLowerCase().includes("paseos");

    return {
      entries: isPaseos ? paseosServiceDirectoryEntries : [],
      categories: serviceDirectoryCategories,
      messageCount: isPaseos ? 867 : 0,
      sourceLabel: isPaseos ? "Paseos Parents WhatsApp" : "Community referrals",
    };
  },
);
