export default function TaskAssignedEmail({ task, actor }: any) {
  const taskUrl = task.board_id 
    ? `https://beaverworld.dev/boards/${task.board_id}?task=${task.id}`
    : `https://beaverworld.dev/boards`;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", backgroundColor: "#f9fafb" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "white", borderRadius: "8px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#111827", fontSize: "24px", marginBottom: "16px" }}>
          You've been assigned to a Task
        </h2>
        
        <p style={{ color: "#374151", fontSize: "16px", lineHeight: "1.5", marginBottom: "24px" }}>
          <strong>{actor.name}</strong> assigned you to a task
        </p>

        <div style={{ backgroundColor: "#f3f4f6", borderRadius: "6px", padding: "20px", marginBottom: "24px" }}>
          <p style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            Task Title
          </p>
          <p style={{ color: "#111827", fontSize: "18px", fontWeight: "600", margin: "0" }}>
            {task.title}
          </p>
        </div>

        {task.description && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Description
            </p>
            <p style={{ color: "#374151", fontSize: "14px", lineHeight: "1.5", margin: "0" }}>
              {task.description}
            </p>
          </div>
        )}

        {task.priority && (
          <div style={{ marginBottom: "24px" }}>
            <span style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "600",
              backgroundColor: task.priority === "Urgent" || task.priority === "High" ? "#fee2e2" : "#dbeafe",
              color: task.priority === "Urgent" || task.priority === "High" ? "#991b1b" : "#1e40af"
            }}>
              Priority: {task.priority}
            </span>
          </div>
        )}

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", marginTop: "24px" }}>
          <a href={taskUrl} style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#2563eb",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            View Task
          </a>
        </div>
      </div>
    </div>
  );
}