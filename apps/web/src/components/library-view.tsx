"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  HandHeart,
  MagnifyingGlass,
  Package,
  Plus,
} from "@phosphor-icons/react";
import type {
  LibraryResource,
  ResourceCategory,
} from "@/server/resource-queries";
import { ButtonLink, Card, Chip } from "./ui";

function willingnessLabel(value: string) {
  if (value === "weekends") return "Usually weekends";
  if (value === "community_projects_only") return "Community projects";
  return "Happy to be asked";
}

export function LibraryView({
  resources,
  categories,
  canAdd,
  added = false,
}: {
  resources: LibraryResource[];
  categories: ResourceCategory[];
  canAdd: boolean;
  added?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return resources.filter(
      (resource) =>
        (category === "all" || resource.categorySlug === category) &&
        (!needle ||
          `${resource.title} ${resource.description} ${resource.categoryLabel}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [resources, category, query]);

  return (
    <div className="content">
      <div className="row-between">
        <div>
          <div className="eyebrow">Paseos sharing library</div>
          <h1 style={{ marginTop: 7 }}>Useful things nearby</h1>
          <p className="lede">
            These neighbors opted to make an item browsable. Nothing is
            automatically bookable—you still ask, and they still choose.
          </p>
        </div>
        {canAdd ? (
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
        <label className="library-search">
          <MagnifyingGlass size={19} aria-hidden />
          <span className="sr-only">Search the Paseos library</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tables, tools, coolers…"
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
          {categories.map((item) => (
            <button
              className="chip"
              data-selected={category === item.slug}
              onClick={() => setCategory(item.slug)}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="library-grid section" aria-live="polite">
        {visible.map((resource) => (
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
                <HandHeart size={15} /> {willingnessLabel(resource.willingness)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {!visible.length ? (
        <Card className="pad soft section">
          <div className="empty-state">
            <span className="empty-icon">
              <MagnifyingGlass size={30} />
            </span>
            <h2>No matching items yet</h2>
            <p className="muted">
              You can still create an Ask. A neighbor can offer an unlisted item
              without adding it to the library first.
            </p>
            <ButtonLink href="/asks/new">Create an Ask</ButtonLink>
          </div>
        </Card>
      ) : null}

      <Card className="pad soft section">
        <div className="row-start">
          <HandHeart size={23} color="var(--green-700)" />
          <div>
            <h3>Do not see what you need?</h3>
            <p className="muted small" style={{ marginBottom: 0 }}>
              The request-first model is the whole point. Ask the community;
              people can offer things they never chose to list.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
