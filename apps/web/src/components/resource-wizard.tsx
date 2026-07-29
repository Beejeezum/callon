"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeSlash,
  HandHeart,
  Package,
  Plus,
  ShieldCheck,
} from "@phosphor-icons/react";
import { commonResourceSuggestions } from "@/lib/pilot";
import type { ResourceCategory } from "@/server/resource-queries";
import { createResourceAction } from "@/server/user-actions";
import { Button, PrivacyCallout } from "./ui";

type Visibility = "private" | "match_only" | "circle";
type Willingness =
  "happy_to_be_asked" | "community_projects_only" | "weekends" | "paused";

export function ResourceWizard({
  circleId,
  categories,
}: {
  circleId: string;
  categories: ResourceCategory[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("match_only");
  const [willingness, setWillingness] =
    useState<Willingness>("happy_to_be_asked");
  const [usualTerms, setUsualTerms] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug),
    [categories, categorySlug],
  );

  function chooseSuggestion(
    suggestion: (typeof commonResourceSuggestions)[number],
  ) {
    setTitle(suggestion.title);
    setCategorySlug(suggestion.category);
  }

  async function save() {
    setPending(true);
    setError("");
    const result = await createResourceAction({
      circleId,
      title,
      description,
      categoryId: selectedCategory?.id,
      visibility,
      willingness,
      usualTerms,
      idempotencyKey,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    if (result.data.resourceId === "preview-resource") {
      router.push("/library?added=1");
    } else {
      router.push(`/resources/${result.data.resourceId}?created=1`);
    }
    router.refresh();
  }

  return (
    <div className="content narrow">
      <div className="stepper" aria-label={`Step ${step} of 2`}>
        <span className="step-dot active" />
        <span className="step-line" />
        <span className={`step-dot ${step === 2 ? "active" : ""}`} />
      </div>

      {step === 1 ? (
        <>
          <div className="eyebrow">Optional and quick</div>
          <h1 style={{ marginTop: 7 }}>What are you open to sharing?</h1>
          <p className="lede">
            Pick a common item or type your own. You can add details later when
            someone actually asks.
          </p>
          <div className="quick-item-grid section">
            {commonResourceSuggestions.map((suggestion) => (
              <button
                type="button"
                className="quick-item"
                data-selected={title === suggestion.title}
                onClick={() => chooseSuggestion(suggestion)}
                key={suggestion.title}
              >
                <span className="choice-icon">
                  <Package size={20} />
                </span>
                <span>{suggestion.title}</span>
                {title === suggestion.title ? (
                  <Check size={17} color="var(--green-700)" weight="bold" />
                ) : null}
              </button>
            ))}
          </div>
          <div className="field section">
            <label htmlFor="custom-item">Or add something else</label>
            <input
              id="custom-item"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Tile saw"
              maxLength={100}
            />
          </div>
          <Button
            full
            disabled={title.trim().length < 2}
            onClick={() => setStep(2)}
          >
            Continue <ArrowRight size={18} />
          </Button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="button neutral small"
            onClick={() => setStep(1)}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="eyebrow section">Your sharing preference</div>
          <h1 style={{ marginTop: 7 }}>{title}</h1>
          <p className="lede">
            No calendar to maintain. Every future request still needs your
            approval.
          </p>
          <div className="form-grid section">
            <div className="field">
              <label htmlFor="resource-category">Category</label>
              <select
                id="resource-category"
                className="select"
                value={categorySlug}
                onChange={(event) => setCategorySlug(event.target.value)}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option value={category.slug} key={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="resource-description">
                Helpful detail <span className="muted">(optional)</span>
              </label>
              <textarea
                id="resource-description"
                className="textarea"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Size, included pieces, or anything that saves a follow-up."
                maxLength={800}
              />
            </div>
            <fieldset className="plain-fieldset">
              <legend>Who can discover it?</legend>
              <div className="choice-list">
                <label className="choice">
                  <EyeSlash size={20} />
                  <span className="list-content">
                    <span className="strong small">
                      Suggest me only when someone asks
                    </span>
                    <span className="help-text" style={{ display: "block" }}>
                      Private matching—recommended
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === "match_only"}
                    onChange={() => setVisibility("match_only")}
                  />
                </label>
                <label className="choice">
                  <Eye size={20} />
                  <span className="list-content">
                    <span className="strong small">
                      Show in the Paseos library
                    </span>
                    <span className="help-text" style={{ display: "block" }}>
                      Members may browse it, but must still ask
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === "circle"}
                    onChange={() => setVisibility("circle")}
                  />
                </label>
                <label className="choice">
                  <ShieldCheck size={20} />
                  <span className="list-content">
                    <span className="strong small">Remember privately</span>
                    <span className="help-text" style={{ display: "block" }}>
                      Only you can see this record
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === "private"}
                    onChange={() => setVisibility("private")}
                  />
                </label>
              </div>
            </fieldset>
            <div className="field">
              <label htmlFor="resource-willingness">When can people ask?</label>
              <select
                id="resource-willingness"
                className="select"
                value={willingness}
                onChange={(event) =>
                  setWillingness(event.target.value as Willingness)
                }
              >
                <option value="happy_to_be_asked">Happy to be asked</option>
                <option value="weekends">Usually weekends</option>
                <option value="community_projects_only">
                  Community projects only
                </option>
                <option value="paused">Not lending right now</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="resource-terms">
                Usual note <span className="muted">(optional)</span>
              </label>
              <input
                id="resource-terms"
                className="input"
                value={usualTerms}
                onChange={(event) => setUsualTerms(event.target.value)}
                placeholder="e.g. Please return it clean"
                maxLength={800}
              />
            </div>
            {error ? <div className="notice error">{error}</div> : null}
            <Button full disabled={pending} onClick={save}>
              <Plus size={18} />
              {pending ? "Saving…" : "Add to my sharing preferences"}
            </Button>
          </div>
          <div className="spacer-16" />
          <PrivacyCallout>
            <HandHeart size={20} /> Adding an item is an invitation to ask, not
            a promise that it is always available.
          </PrivacyCallout>
        </>
      )}
    </div>
  );
}
