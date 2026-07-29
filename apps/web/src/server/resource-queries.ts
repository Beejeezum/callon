import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type ResourceCategory = {
  id: string;
  slug: string;
  label: string;
  riskLevel: "low" | "moderate";
};

export type LibraryResource = {
  id: string;
  title: string;
  description: string;
  categoryLabel: string;
  categorySlug: string;
  willingness: string;
  ownerName: string;
  image?: string;
};

const mockCategories: ResourceCategory[] = [
  {
    id: "5a7fa44b-c715-4b47-a5b2-875edc821001",
    slug: "basic-tools",
    label: "Basic tools",
    riskLevel: "low",
  },
  {
    id: "5a7fa44b-c715-4b47-a5b2-875edc821002",
    slug: "ladders",
    label: "Ladders",
    riskLevel: "moderate",
  },
  {
    id: "5a7fa44b-c715-4b47-a5b2-875edc821003",
    slug: "yard-equipment",
    label: "Yard equipment",
    riskLevel: "moderate",
  },
  {
    id: "5a7fa44b-c715-4b47-a5b2-875edc821004",
    slug: "party-events",
    label: "Party & event gear",
    riskLevel: "low",
  },
  {
    id: "5a7fa44b-c715-4b47-a5b2-875edc821005",
    slug: "tables-chairs",
    label: "Tables & chairs",
    riskLevel: "low",
  },
  {
    id: "5a7fa44b-c715-4b47-a5b2-875edc821006",
    slug: "electronics",
    label: "Electronics",
    riskLevel: "low",
  },
  {
    id: "5a7fa44b-c715-4b47-a5b2-875edc821007",
    slug: "cleaning-equipment",
    label: "Cleaning equipment",
    riskLevel: "moderate",
  },
];

const mockResources: LibraryResource[] = [
  {
    id: "tables",
    title: "2 folding tables",
    description: "Six-foot folding tables. Happy to be asked for parties.",
    categoryLabel: "Tables & chairs",
    categorySlug: "tables-chairs",
    willingness: "happy_to_be_asked",
    ownerName: "Janet",
    image: "/assets/folding-table.jpg",
  },
  {
    id: "cooler",
    title: "Large hard-side cooler",
    description: "Great for backyard parties and community events.",
    categoryLabel: "Party & event gear",
    categorySlug: "party-events",
    willingness: "weekends",
    ownerName: "Mark",
    image: "/assets/cooler.jpg",
  },
  {
    id: "ladder",
    title: "8-foot extension ladder",
    description: "Ask each time. Moderate-risk item with a simple handoff log.",
    categoryLabel: "Ladders",
    categorySlug: "ladders",
    willingness: "happy_to_be_asked",
    ownerName: "Priya",
    image: "/assets/ladder.png",
  },
  {
    id: "pressure-washer",
    title: "Pressure washer",
    description: "Usually available on weekends for Paseos projects.",
    categoryLabel: "Yard equipment",
    categorySlug: "yard-equipment",
    willingness: "weekends",
    ownerName: "Alex",
    image: "/assets/pressure-washer.jpg",
  },
];

export const getResourceCategories = cache(
  async (): Promise<ResourceCategory[]> => {
    if (!isSupabaseConfigured) return mockCategories;
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("categories")
      .select("id, slug, label, default_risk_level")
      .eq("is_active", true)
      .in("default_risk_level", ["low", "moderate"])
      .order("sort_order");
    return (data ?? []).map((category) => ({
      id: category.id,
      slug: category.slug,
      label: category.label,
      riskLevel: category.default_risk_level as "low" | "moderate",
    }));
  },
);

export const getCircleLibrary = cache(
  async (
    circleId: string | null,
    profileId: string | null,
  ): Promise<LibraryResource[]> => {
    if (!isSupabaseConfigured || !circleId || !profileId) return mockResources;
    const supabase = await createSupabaseServerClient();
    const { data: resources } = await supabase
      .from("resources")
      .select(
        "id, title, description, category_id, willingness, owner_profile_id, image_path",
      )
      .eq("circle_id", circleId)
      .eq("visibility", "circle")
      .eq("status", "active")
      .order("updated_at", { ascending: false });

    const categoryIds = [
      ...new Set(
        (resources ?? [])
          .map((resource) => resource.category_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const ownerIds = [
      ...new Set(
        (resources ?? []).map((resource) => resource.owner_profile_id),
      ),
    ];
    const [{ data: categories }, { data: owners }] = await Promise.all([
      categoryIds.length
        ? supabase
            .from("categories")
            .select("id, slug, label")
            .in("id", categoryIds)
        : Promise.resolve({ data: [] }),
      ownerIds.length
        ? supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", ownerIds)
        : Promise.resolve({ data: [] }),
    ]);

    return (resources ?? []).map((resource) => {
      const category = (categories ?? []).find(
        (candidate) => candidate.id === resource.category_id,
      );
      const owner = (owners ?? []).find(
        (candidate) => candidate.id === resource.owner_profile_id,
      );
      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        categoryLabel: category?.label ?? "Useful things",
        categorySlug: category?.slug ?? "other",
        willingness: resource.willingness,
        ownerName:
          resource.owner_profile_id === profileId
            ? "You"
            : (owner?.display_name ?? "A Paseos neighbor"),
        image: resource.image_path ?? undefined,
      };
    });
  },
);
