export default function IssueClosedEmail({ issue, actor, closingMessage }: any) {
  const issueUrl = issue.issue_number 
    ? `https://beaverworld.dev/issues/${issue.issue_number}`
    : `https://beaverworld.dev/issues`;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", backgroundColor: "#f9fafb" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "white", borderRadius: "8px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#111827", fontSize: "24px", marginBottom: "16px" }}>
          Issue Closed
        </h2>
        
        <p style={{ color: "#374151", fontSize: "16px", lineHeight: "1.5", marginBottom: "24px" }}>
          <strong>{actor.name}</strong> closed Issue #{issue.issue_number || "Issue"}
        </p>

        <div style={{ backgroundColor: "#f3f4f6", borderRadius: "6px", padding: "20px", marginBottom: "24px" }}>
          <p style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            Issue #{issue.issue_number || "Issue"}
          </p>
          <p style={{ color: "#111827", fontSize: "18px", fontWeight: "600", margin: "0" }}>
            {issue.title}
          </p>
        </div>

        {closingMessage && (
          <div style={{ marginBottom: "24px", backgroundColor: "#ecfdf5", borderLeft: "4px solid #10b981", padding: "16px", borderRadius: "4px" }}>
            <p style={{ color: "#047857", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", fontWeight: "600" }}>
              Closing Message
            </p>
            <p style={{ color: "#065f46", fontSize: "14px", lineHeight: "1.5", margin: "0" }}>
              {closingMessage}
            </p>
          </div>
        )}

        {issue.solved_commit_number && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Solved in Commit
            </p>
            <p style={{ color: "#374151", fontSize: "14px", fontFamily: "monospace", margin: "0" }}>
              {issue.solved_commit_number}
            </p>
          </div>
        )}

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", marginTop: "24px" }}>
          <a href={issueUrl} style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#10b981",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            View Closed Issue
          </a>
        </div>
      </div>
    </div>
  );
}