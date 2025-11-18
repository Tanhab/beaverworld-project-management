export default function DeadlineEmail({ issue }: any) {
  const issueUrl = issue.issue_number 
    ? `https://beaverworld.dev/issues/${issue.issue_number}`
    : `https://beaverworld.dev/issues`;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", backgroundColor: "#f9fafb" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "white", borderRadius: "8px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#dc2626", fontSize: "24px", marginBottom: "16px" }}>
          ⚠️ Deadline Approaching
        </h2>
        
        <p style={{ color: "#374151", fontSize: "16px", lineHeight: "1.5", marginBottom: "24px" }}>
          Issue #{issue.issue_number || "Issue"} is due <strong>tomorrow</strong>
        </p>

        <div style={{ backgroundColor: "#fef2f2", borderLeft: "4px solid #dc2626", padding: "20px", borderRadius: "4px", marginBottom: "24px" }}>
          <p style={{ color: "#991b1b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", fontWeight: "600" }}>
            Issue #{issue.issue_number || "Issue"}
          </p>
          <p style={{ color: "#7f1d1d", fontSize: "18px", fontWeight: "600", margin: "0" }}>
            {issue.title}
          </p>
        </div>

        {issue.deadline && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Deadline
            </p>
            <p style={{ color: "#dc2626", fontSize: "16px", fontWeight: "600", margin: "0" }}>
              {new Date(issue.deadline).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}

        {issue.priority && (
          <div style={{ marginBottom: "24px" }}>
            <span style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "600",
              backgroundColor: "#fee2e2",
              color: "#991b1b"
            }}>
              Priority: {issue.priority}
            </span>
          </div>
        )}

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", marginTop: "24px" }}>
          <a href={issueUrl} style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#dc2626",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            View Issue Now
          </a>
        </div>
      </div>
    </div>
  );
}