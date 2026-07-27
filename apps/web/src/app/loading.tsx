export default function Loading() {
  return (
    <div className="app-frame public">
      <main className="app-surface">
        <div className="page-shell">
          <div className="content narrow">
            <div className="stack" aria-label="Loading">
              <div
                className="card"
                style={{ height: 68, background: "var(--surface-soft)" }}
              />
              <div
                className="card"
                style={{ height: 210, background: "var(--surface-soft)" }}
              />
              <div
                className="card"
                style={{ height: 150, background: "var(--surface-soft)" }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
