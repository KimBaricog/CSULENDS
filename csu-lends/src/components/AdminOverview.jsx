import AdminChart from "./AdminChart";

function Stat({ label, value, hint, tone }) {
  return (
    <div className={`adminstat ${tone ? `adminstat--${tone}` : ""}`}>
      <span className="adminstat-label">{label}</span>
      <strong className="adminstat-value">{value}</strong>
      {hint && <span className="adminstat-hint">{hint}</span>}
    </div>
  );
}

// The numbers: users, who is online, items, requests, and two charts.
export default function AdminOverview({
  stats,
  onGoReview,
  onGoIssues,
  issueCount,
  verifyPending = 0,
  onGoVerify,
}) {
  const { users, items, requests } = stats;

  return (
    <div className="adminoverview">
      {items.pending > 0 && (
        <button
          type="button"
          className="adminoverview-cta"
          onClick={onGoReview}
        >
          <span>
            <strong>
              {items.pending} {items.pending === 1 ? "item is" : "items are"}{" "}
              waiting for review
            </strong>
            <small>Students cannot see them until you approve</small>
          </span>
          <span className="adminoverview-cta-go">Review now</span>
        </button>
      )}

      {verifyPending > 0 && onGoVerify && (
        <button
          type="button"
          className="adminoverview-alert adminoverview-alert--verify"
          onClick={onGoVerify}
        >
          {verifyPending} {verifyPending === 1 ? "student is" : "students are"}{" "}
          waiting to be verified. Check their documents
        </button>
      )}

      {issueCount > 0 && (
        <button
          type="button"
          className="adminoverview-alert"
          onClick={onGoIssues}
        >
          {issueCount} {issueCount === 1 ? "thing needs" : "things need"} your
          attention. See Issues
        </button>
      )}

      <h2 className="adminsection-title">Students</h2>
      <div className="adminstats">
        <Stat
          label="Total students"
          value={users.total}
          hint={`${users.confirmed} confirmed`}
        />
        <Stat
          label="Online now"
          value={users.online_now}
          hint="seen in the last 5 min"
          tone="live"
        />
        <Stat
          label="Active today"
          value={users.active_24h}
          hint={`${users.active_7d} this week`}
        />
        <Stat
          label="New this week"
          value={users.new_7d}
          hint={`${users.unconfirmed} not confirmed yet`}
        />
      </div>

      <h2 className="adminsection-title">Items and loans</h2>
      <div className="adminstats">
        <Stat
          label="Items live"
          value={items.approved}
          hint={`${items.total} submitted in total`}
        />
        <Stat
          label="Waiting for review"
          value={items.pending}
          hint={`${items.rejected} rejected`}
          tone={items.pending > 0 ? "warn" : ""}
        />
        <Stat
          label="Loans in progress"
          value={requests.accepted}
          hint={`${requests.overdue} past return date`}
          tone={requests.overdue > 0 ? "warn" : ""}
        />
        <Stat
          label="Requests waiting"
          value={requests.pending}
          hint={`${requests.returned} returned so far`}
        />
      </div>

      <h2 className="adminsection-title">Last 14 days</h2>
      <div className="adminoverview-charts">
        <AdminChart title="New students" data={stats.signups_14d} />
        <AdminChart
          title="Borrow requests"
          data={stats.requests_14d}
          color="var(--success-color, #17825a)"
        />
      </div>
    </div>
  );
}
