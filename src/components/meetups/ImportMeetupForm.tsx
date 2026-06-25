import { useState } from "react";
import { withBase } from "../../lib/utils";

interface RssEvent {
  title: string;
  description: string;
  link: string;
  date?: string;
  time?: string;
}

interface EventDraft {
  selected: boolean;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  capacity: number;
}

type ImportResult = { title: string; ok: true } | { title: string; ok: false; error: string };

const MAX_DESC = 1990;
const today = new Date().toISOString().split("T")[0];

function makeDraft(ev: RssEvent): EventDraft {
  return {
    selected: true,
    title: ev.title.slice(0, 100),
    description: ev.description.slice(0, MAX_DESC),
    date: ev.date ?? "",
    time: ev.time ?? "18:00",
    venue: "",
    address: "",
    capacity: 30,
  };
}

export default function ImportMeetupForm() {
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [events, setEvents] = useState<RssEvent[]>([]);
  const [drafts, setDrafts] = useState<EventDraft[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);

  const phase = results.length > 0 ? "done" : events.length > 0 ? "review" : "input";

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setFetching(true);
    setFetchError("");
    try {
      const res = await fetch(withBase("/api/import/meetup-rss"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch feed.");
      if (!data.events?.length) {
        setFetchError(data.message ?? "No upcoming events found in this feed.");
        return;
      }
      setEvents(data.events);
      setDrafts(data.events.map(makeDraft));
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setFetching(false);
    }
  }

  function updateDraft(i: number, field: keyof EventDraft, value: string | number | boolean) {
    setDrafts((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    const selected = drafts.filter((d) => d.selected);
    if (!selected.length) return;

    // Validate all selected drafts
    for (const d of selected) {
      if (!d.date) { alert(`Please set a date for "${d.title}"`); return; }
      if (!d.venue.trim()) { alert(`Please set a venue for "${d.title}"`); return; }
    }

    setImporting(true);
    const outcomes: ImportResult[] = [];
    for (const d of selected) {
      try {
        const res = await fetch(withBase("/api/gatherings"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: d.title,
            description: d.description,
            date: d.date,
            time: d.time,
            venue: d.venue,
            address: d.address || undefined,
            capacity: d.capacity,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create gathering.");
        outcomes.push({ title: d.title, ok: true });
      } catch (err) {
        outcomes.push({ title: d.title, ok: false, error: err instanceof Error ? err.message : "Unknown error." });
      }
    }
    setResults(outcomes);
    setImporting(false);
  }

  // ── Input phase ────────────────────────────────────────────────────────────
  if (phase === "input") {
    return (
      <div className="imf-wrap">
        <p className="imf-intro">
          Paste your Meetup group URL below. The title and description will be imported
          automatically — you'll fill in the date, time, and venue before creating each gathering.
        </p>
        <form onSubmit={handleFetch} className="imf-url-form">
          <div className="form-group">
            <label htmlFor="meetupUrl">Meetup group URL</label>
            <input
              id="meetupUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.meetup.com/your-group-name/"
              required
            />
            <span className="form-hint">
              Any Meetup group URL works — e.g. <code>meetup.com/your-group/</code> or
              the full <code>/events/rss</code> address.
            </span>
          </div>
          {fetchError && <div className="alert alert-error" role="alert">{fetchError}</div>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={fetching}>
              {fetching ? "Fetching events…" : "Fetch upcoming events →"}
            </button>
            <a href={withBase("/dashboard/gatherings")} className="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>
    );
  }

  // ── Done phase ─────────────────────────────────────────────────────────────
  if (phase === "done") {
    const succeeded = results.filter((r) => r.ok);
    const failed = results.filter((r) => !r.ok);
    return (
      <div className="imf-wrap">
        <div className="imf-results">
          {succeeded.length > 0 && (
            <div className="alert alert-success">
              <strong>{succeeded.length} gathering{succeeded.length > 1 ? "s" : ""} created successfully.</strong>
            </div>
          )}
          {failed.length > 0 && (
            <div className="alert alert-error">
              <strong>{failed.length} failed:</strong>
              <ul className="imf-error-list">
                {failed.map((r, i) => (
                  <li key={i}><em>{r.title}</em> — {!r.ok && r.error}</li>
                ))}
              </ul>
            </div>
          )}
          <a href={withBase("/dashboard/gatherings")} className="btn btn-primary">Go to gatherings →</a>
        </div>
      </div>
    );
  }

  // ── Review phase ───────────────────────────────────────────────────────────
  const selectedCount = drafts.filter((d) => d.selected).length;

  return (
    <div className="imf-wrap">
      <p className="imf-intro">
        Found <strong>{events.length}</strong> upcoming event{events.length > 1 ? "s" : ""}. Fill in the
        missing details, then import.
      </p>
      <form onSubmit={handleImport}>
        <div className="imf-event-list">
          {drafts.map((draft, i) => (
            <div key={i} className={`imf-event-card${draft.selected ? " is-selected" : ""}`}>
              <label className="imf-event-toggle">
                <input
                  type="checkbox"
                  checked={draft.selected}
                  onChange={(e) => updateDraft(i, "selected", e.target.checked)}
                />
                <span className="imf-event-toggle-label">Import this event</span>
              </label>

              {draft.selected && (
                <div className="imf-event-fields">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => updateDraft(i, "title", e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={draft.description}
                      onChange={(e) => updateDraft(i, "description", e.target.value)}
                      rows={6}
                      required
                      minLength={20}
                      maxLength={2000}
                    />
                    {events[i].description.length > MAX_DESC && (
                      <span className="form-hint imf-truncated-notice">
                        Description was truncated to 2,000 characters — edit as needed.
                      </span>
                    )}
                    <span className="form-hint">
                      <a href={events[i].link} target="_blank" rel="noopener">View original on Meetup ↗</a>
                    </span>
                  </div>

                  {(!events[i].date || !events[i].time) && (
                    <div className="imf-missing-label">Required — not available in the RSS feed</div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        value={draft.date}
                        onChange={(e) => updateDraft(i, "date", e.target.value)}
                        min={today}
                        required
                      />
                      {events[i].date && (
                        <span className="form-hint imf-autofilled">✓ Detected from Meetup — please verify</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Time *</label>
                      <input
                        type="time"
                        value={draft.time}
                        onChange={(e) => updateDraft(i, "time", e.target.value)}
                        required
                      />
                      {events[i].time && (
                        <span className="form-hint imf-autofilled">✓ Detected from Meetup — please verify</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Venue *</label>
                    <input
                      type="text"
                      value={draft.venue}
                      onChange={(e) => updateDraft(i, "venue", e.target.value)}
                      placeholder="The Interval at Long Now"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={draft.address}
                      onChange={(e) => updateDraft(i, "address", e.target.value)}
                      placeholder="123 Main St, San Francisco, CA"
                    />
                  </div>

                  <div className="form-group imf-capacity">
                    <label>Capacity *</label>
                    <input
                      type="number"
                      value={draft.capacity}
                      onChange={(e) => updateDraft(i, "capacity", Number(e.target.value))}
                      min={1}
                      max={500}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="imf-submit-row">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={importing || selectedCount === 0}
          >
            {importing
              ? "Importing…"
              : `Import ${selectedCount} gathering${selectedCount !== 1 ? "s" : ""} →`}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => { setEvents([]); setDrafts([]); setUrl(""); }}>
            ← Start over
          </button>
        </div>
      </form>
    </div>
  );
}
