import { useState } from "react";
import axiosClient from "../api/axiosClient";
import Layout from "../components/Layout";

const colors = {
  border: "#2a2d36",
  text: "#e6e8ec",
  muted: "#a0a6b0",
  accent: "#d6304f",
  danger: "#e05c5c",
  inputBg: "#0e1015",
};

const SUGGESTIONS = [
  "Which customers need follow-up this week?",
  "Which customers showed high opportunity recently?",
  "What are the pending tasks right now?",
];

function parseInlineBold(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}

function isTableRow(line) {
  return /^\s*\|.*\|\s*$/.test(line);
}

function isTableSeparator(line) {
  return isTableRow(line) && /^[\s|:-]+$/.test(line);
}

function parseTableRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

// Turns the assistant's markdown-ish text (bold + GFM tables) into React
// elements, so tables render as tables instead of raw "| a | b |" text.
function renderAnswer(text) {
  const lines = text.split("\n");
  const blocks = [];
  let paragraphBuffer = [];
  let i = 0;

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "p", content: paragraphBuffer.join(" ") });
      paragraphBuffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushParagraph();
      const header = parseTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
    } else {
      paragraphBuffer.push(line.trim());
    }
    i += 1;
  }
  flushParagraph();

  return blocks.map((block, idx) => {
    if (block.type === "table") {
      return (
        <div key={idx} style={{ overflowX: "auto", margin: "6px 0 12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                {block.header.map((h, hi) => (
                  <th
                    key={hi}
                    style={{
                      textAlign: "left",
                      padding: "7px 12px",
                      borderBottom: `1px solid ${colors.border}`,
                      color: colors.muted,
                      fontSize: 11.5,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: "7px 12px",
                        borderBottom: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <p key={idx} style={{ margin: idx === blocks.length - 1 ? 0 : "0 0 10px", lineHeight: 1.6 }}>
        {parseInlineBold(block.content, idx)}
      </p>
    );
  });
}

function AiAssistant() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]); // [{question, answer}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ask = async (q) => {
    const finalQuestion = (q ?? question).trim();
    if (!finalQuestion) return;

    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.post("/ai/assistant", { question: finalQuestion });
      setHistory((prev) => [...prev, { question: finalQuestion, answer: res.data.answer }]);
      setQuestion("");
    } catch (err) {
      setError("Couldn't reach the AI assistant. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask();
  };

  return (
    <Layout>
      <div>
        <h2 style={{ margin: "0 0 4px" }}>AI Assistant</h2>
        <p style={{ margin: "0 0 24px", color: colors.muted, fontSize: 14 }}>
          Ask about customers, visits, or pending follow-ups — answers are grounded in your real data.
        </p>

        {history.length === 0 && !loading && (
          <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 20,
                  border: `1px solid ${colors.border}`,
                  background: "transparent",
                  color: colors.muted,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          {history.map((item, i) => (
            <div key={i}>
              <div style={{
                alignSelf: "flex-end",
                color: colors.text,
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 6,
              }}>
                {item.question}
              </div>
              <div style={{
                background: "#171a21",
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: "12px 14px",
                color: colors.text,
                fontSize: 14,
              }}>
                {renderAnswer(item.answer)}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ color: colors.muted, fontSize: 14 }}>Thinking...</div>
          )}
        </div>

        {error && (
          <div style={{
            marginBottom: 14,
            padding: "10px 12px",
            borderRadius: 6,
            background: "rgba(224, 92, 92, 0.12)",
            color: colors.danger,
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your customers, visits or tasks..."
            style={{
              flex: 1,
              padding: "12px 14px",
              background: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              color: colors.text,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            style={{
              padding: "0 22px",
              background: loading || !question.trim() ? "#2a2d36" : colors.accent,
              color: loading || !question.trim() ? colors.muted : "#ffffff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !question.trim() ? "not-allowed" : "pointer",
            }}
          >
            Ask
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default AiAssistant;