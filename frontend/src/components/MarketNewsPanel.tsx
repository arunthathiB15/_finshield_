import type { NewsArticle, NewsResponse, ThemeMode } from "../types";

type MarketNewsPanelProps = {
  data?: NewsResponse;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRefresh: () => void;
  theme?: ThemeMode;
};

function formatPublishedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="news-item">
      {article.thumbnail_url && (
        <img
          className="news-thumbnail"
          src={article.thumbnail_url}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
      <div className="news-item-content">
        <div className="news-meta">
          <span className={`news-category news-category-${article.category}`}>
            {article.category === "asset" ? "Selected asset" : "Market & finance"}
          </span>
          <span>{article.publisher}</span>
          <time dateTime={article.published_at}>{formatPublishedAt(article.published_at)}</time>
        </div>
        <a className="news-title" href={article.link} target="_blank" rel="noreferrer">
          {article.title}
          <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span>
        </a>
        {article.summary && <p className="news-summary">{article.summary}</p>}
      </div>
    </article>
  );
}

export function MarketNewsPanel({
  data,
  isLoading,
  isFetching,
  isError,
  onRefresh,
  theme = "dark",
}: MarketNewsPanelProps) {
  const isDark = theme === "dark";

  return (
    <section className="dynamic-glass-card market-news-panel p-5 sm:p-7 flex flex-col gap-5">
      <div className="news-header-row">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest uppercase text-blue-600 dark:text-primary-container">
            MARKET NEWS
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight mt-1 ${isDark ? "text-on-surface" : "text-text-obsidian"}`}>
            Market and finance headlines
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant max-w-3xl">
            Headlines for {data?.asset_name ?? "the selected asset"} and the broader stock market. Click Refresh news to check for newer stories.
          </p>
        </div>
        <button className="news-refresh-button" type="button" onClick={onRefresh} disabled={isFetching}>
          <span className={`material-symbols-outlined text-[17px] ${isFetching ? "animate-spin" : ""}`} aria-hidden="true">
            refresh
          </span>
          {isFetching ? "Updating" : "Refresh news"}
        </button>
      </div>

      {data && (
        <div className="news-status-row">
          <span className="news-feed-indicator"><span /> NEWS FEED</span>
          <span>Updated {formatPublishedAt(data.fetched_at)}</span>
          <span>Source: {data.source}</span>
        </div>
      )}

      {isLoading && <p className="empty-panel">Loading current market headlines…</p>}
      {isError && (
        <p className="error-panel">
          No headlines are available right now. Click Refresh news to try again.
        </p>
      )}
      {data?.warning && <p className="news-warning">{data.warning}</p>}

      {data && data.items.length > 0 && (
        <div className="news-list">
          {data.items.map((article) => <NewsCard article={article} key={article.id} />)}
        </div>
      )}

      {data && !data.items.length && !isLoading && (
        <p className="empty-panel">No headlines are available yet. Click Refresh news to try again.</p>
      )}
    </section>
  );
}
