"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AddressBook,
  CheckCircle,
  HandHeart,
  MagnifyingGlass,
  Package,
  Plus,
  SealCheck,
  Sparkle,
} from "@phosphor-icons/react";
import type { ServiceDirectoryEntry } from "@/lib/service-directory";
import type {
  LibraryResource,
  ResourceCategory,
} from "@/server/resource-queries";
import { ButtonLink, Card, Chip, PrivacyCallout } from "./ui";

function willingnessLabel(value: string) {
  if (value === "weekends") return "Usually weekends";
  if (value === "community_projects_only") return "Community projects";
  return "Happy to be asked";
}

export function LibraryView({
  resources,
  categories,
  services,
  serviceCategories,
  serviceMessageCount,
  serviceSourceLabel,
  canAdd,
  added = false,
}: {
  resources: LibraryResource[];
  categories: ResourceCategory[];
  services: ServiceDirectoryEntry[];
  serviceCategories: readonly { slug: string; label: string }[];
  serviceMessageCount: number;
  serviceSourceLabel: string;
  canAdd: boolean;
  added?: boolean;
}) {
  const [mode, setMode] = useState<"items" | "services">("services");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const visibleResources = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return resources.filter(
      (resource) =>
        mode === "items" &&
        (category === "all" || resource.categorySlug === category) &&
        (!needle ||
          `${resource.title} ${resource.description} ${resource.categoryLabel}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [resources, category, query, mode]);
  const visibleServices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter(
      (service) =>
        mode === "services" &&
        (category === "all" || service.categorySlug === category) &&
        (!needle ||
          `${service.vendor} ${service.category} ${service.contact ?? ""} ${service.notes}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [services, category, query, mode]);
  const activeCategories = mode === "services" ? serviceCategories : categories;
  const hasResults =
    mode === "services" ? visibleServices.length > 0 : visibleResources.length > 0;
  const validatedServices = services.filter(
    (service) => service.validationCount >= 2,
  ).length;

  return (
    <div className="content">
      <div className="row-between">
        <div>
          <div className="eyebrow">Paseos community library</div>
          <h1 style={{ marginTop: 7 }}>Useful things and trusted help</h1>
          <p className="lede">
            Browse borrowable items and Paseos-only service referrals. Nothing
            is auto-booked; Call On keeps the next step human.
          </p>
        </div>
        {canAdd && mode === "items" ? (
          <ButtonLink href="/resources/new" small>
            <Plus size={17} /> Add item
          </ButtonLink>
        ) : null}
      </div>

      {added ? (
        <div className="notice section" role="status">
          <strong>Item saved.</strong> Its visibility controls whether other
          Paseos members see it here.
        </div>
      ) : null}

      <div className="library-tools section">
        <div className="library-mode-switch" aria-label="Choose library view">
          <button
            type="button"
            data-selected={mode === "services"}
            onClick={() => {
              setMode("services");
              setCategory("all");
            }}
          >
            <AddressBook size={17} /> Services
          </button>
          <button
            type="button"
            data-selected={mode === "items"}
            onClick={() => {
              setMode("items");
              setCategory("all");
            }}
          >
            <Package size={17} /> Items
          </button>
        </div>
        <label className="library-search">
          <MagnifyingGlass size={19} aria-hidden />
          <span className="sr-only">
            Search the Paseos {mode === "services" ? "directory" : "library"}
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              mode === "services"
                ? "Search plumber, painter, tutor..."
                : "Search tables, tools, coolers..."
            }
          />
        </label>
        <div className="chip-row" aria-label="Filter library by category">
          <button
            className="chip"
            data-selected={category === "all"}
            onClick={() => setCategory("all")}
          >
            All
          </button>
          {activeCategories.map((item) => (
            <button
              className="chip"
              data-selected={category === item.slug}
              onClick={() => setCategory(item.slug)}
              key={item.slug}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "services" ? (
        <>
          <div className="directory-summary section">
            <div>
              <strong>{services.length}</strong>
              <span>service leads</span>
            </div>
            <div>
              <strong>{validatedServices}</strong>
              <span>neighbor-validated</span>
            </div>
            <div>
              <strong>{serviceMessageCount}</strong>
              <span>messages scanned</span>
            </div>
          </div>
          <PrivacyCallout>
            This directory belongs to this community. Recommenders stay private,
            and future circles build their own referral history from their own
            asks, referrals, and approved imports.
          </PrivacyCallout>
          <p className="tiny muted directory-source">
            Seed source: {serviceSourceLabel}
          </p>
          <div className="directory-list section" aria-live="polite">
            {visibleServices.map((service) => (
              <ServiceDirectoryCard service={service} key={service.id} />
            ))}
          </div>
        </>
      ) : (
        <div className="library-grid section" aria-live="polite">
          {visibleResources.map((resource) => (
            <Link
              href={`/resources/${resource.id}`}
              className="card library-card interactive"
              key={resource.id}
            >
              {resource.image ? (
                <Image
                  className="library-card-image"
                  src={resource.image}
                  alt=""
                  width={320}
                  height={210}
                />
              ) : (
                <span className="library-card-placeholder">
                  <Package size={34} weight="duotone" />
                </span>
              )}
              <div className="library-card-copy">
                <div className="row-between">
                  <Chip tone="violet">{resource.categoryLabel}</Chip>
                  <span className="tiny muted">{resource.ownerName}</span>
                </div>
                <h2>{resource.title}</h2>
                <p className="muted small">{resource.description}</p>
                <span className="factual-history">
                  <HandHeart size={15} />{" "}
                  {willingnessLabel(resource.willingness)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!hasResults ? (
        <Card className="pad soft section">
          <div className="empty-state">
            <span className="empty-icon">
              <MagnifyingGlass size={30} />
            </span>
            <h2>
              No matching {mode === "services" ? "services" : "items"} yet
            </h2>
            <p className="muted">
              You can still create an Ask. A neighbor can share a referral or
              offer something that is not listed here yet.
            </p>
            <ButtonLink href="/asks/new">Create an Ask</ButtonLink>
          </div>
        </Card>
      ) : null}

      <Card className="pad soft section">
        <div className="row-start">
          {mode === "services" ? (
            <Sparkle size={23} color="var(--green-700)" />
          ) : (
            <HandHeart size={23} color="var(--green-700)" />
          )}
          <div>
            <h3>
              {mode === "services"
                ? "Know who deserves another vote?"
                : "Do not see what you need?"}
            </h3>
            <p className="muted small" style={{ marginBottom: 0 }}>
              {mode === "services"
                ? "Call On can turn repeat community referrals into a ranked, living directory as neighbors validate them."
                : "The request-first model is the whole point. Ask the community; people can offer things they never chose to list."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ServiceDirectoryCard({
  service,
}: {
  service: ServiceDirectoryEntry;
}) {
  const validationLabel =
    service.validationCount >= 2
      ? `${service.validationCount}+ neighbor validations`
      : service.validationCount === 1
        ? "1 neighbor validation"
        : "Possible lead";

  return (
    <Card className="directory-card interactive">
      <div className="directory-card-main">
        <div className="row-between">
          <Chip tone={service.confidence === "high" ? "green" : "violet"}>
            {service.category}
          </Chip>
          <span className={`confidence-pill ${service.confidence}`}>
            {service.confidence}
          </span>
        </div>
        <h2>{service.vendor}</h2>
        {service.contact ? (
          <p className="directory-contact">{service.contact}</p>
        ) : (
          <p className="directory-contact muted">Contact not in public chat</p>
        )}
        <p className="muted small">{service.notes}</p>
      </div>
      <div className="directory-card-meta">
        <span className="directory-validation">
          {service.validationCount >= 2 ? (
            <SealCheck size={17} weight="duotone" />
          ) : (
            <CheckCircle size={17} weight="duotone" />
          )}
          {validationLabel}
        </span>
        <span className="tiny muted">
          Source messages {service.sourceMessageIds.slice(0, 3).join(", ")}
          {service.sourceMessageIds.length > 3 ? "..." : ""}
        </span>
      </div>
    </Card>
  );
}
