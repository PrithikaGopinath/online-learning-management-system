import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export default function Quiz() {
  const [profile, setProfile] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizSubject, setQuizSubject] = useState("");
  const [quizGrade, setQuizGrade] = useState("1");
  const [quizQuestions, setQuizQuestions] = useState([
    {
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "a",
    },
  ]);
  const [saving, setSaving] = useState(false);

  const fetchQuizzes = async (profileData) => {
    let query = supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });
    if (profileData && profileData.role === "student")
      query = query.eq("grade", profileData.grade);
    else if (profileData && profileData.role === "tutor")
      query = query.eq("created_by", profileData.id);
    const { data } = await query;
    setQuizzes(data || []);
  };

  const fetchAttempts = async (profileData) => {
    if (!profileData) return;
    const { data } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("student_id", profileData.id);
    setAttempts(data || []);
  };

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
      await fetchQuizzes(profileData);
      await fetchAttempts(profileData);
      setLoading(false);
    };
    getData();
  }, []);

  const handleStartQuiz = async (quiz) => {
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.id);
    setSelectedQuiz(quiz);
    setQuestions(data || []);
    setAnswers({});
    setResult(null);
    setView("take");
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) score++;
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("quiz_attempts").insert({
      quiz_id: selectedQuiz.id,
      student_id: user.id,
      score,
      total: questions.length,
    });
    setResult({ score, total: questions.length });
    setView("result");
    await fetchAttempts(profile);
  };

  const addQuestion = () =>
    setQuizQuestions([
      ...quizQuestions,
      {
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "a",
      },
    ]);
  const removeQuestion = (i) =>
    setQuizQuestions(quizQuestions.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, value) => {
    const updated = [...quizQuestions];
    updated[i][field] = value;
    setQuizQuestions(updated);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: quiz, error } = await supabase
        .from("quizzes")
        .insert({
          title: quizTitle,
          subject: quizSubject,
          grade: quizGrade,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      const { error: qError } = await supabase
        .from("quiz_questions")
        .insert(quizQuestions.map((q) => ({ quiz_id: quiz.id, ...q })));
      if (qError) throw qError;
      setMessage("Quiz created!");
      setQuizTitle("");
      setQuizSubject("");
      setQuizGrade("1");
      setQuizQuestions([
        {
          question: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_answer: "a",
        },
      ]);
      setShowForm(false);
      await fetchQuizzes(profile);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setSaving(false);
  };

  const hasAttempted = (id) => attempts.some((a) => a.quiz_id === id);
  const getScore = (id) => {
    const a = attempts.find((a) => a.quiz_id === id);
    return a ? `${a.score}/${a.total}` : null;
  };
  const getColor = (score, total) => {
    const p = (score / total) * 100;
    return p >= 80 ? "#2e7d32" : p >= 50 ? "#e65100" : "#c62828";
  };
  const getEmoji = (score, total) => {
    const p = (score / total) * 100;
    return p === 100 ? "🏆" : p >= 80 ? "🌟" : p >= 50 ? "👍" : "📚";
  };

  if (loading) return <div style={styles.loading}>Loading quizzes...</div>;

  if (view === "take" && selectedQuiz) {
    return (
      <div style={styles.container}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 style={styles.title}>{selectedQuiz.title}</h1>
            <p style={styles.subtitle}>
              {selectedQuiz.subject} • Grade {selectedQuiz.grade} •{" "}
              {questions.length} questions
            </p>
          </div>
          <button style={styles.backBtn} onClick={() => setView("list")}>
            ← Back
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          {questions.map((q, index) => (
            <div
              key={q.id}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  color: "#333",
                  marginBottom: "16px",
                  lineHeight: "1.5",
                }}
              >
                Q{index + 1}. {q.question}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {["a", "b", "c", "d"].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: answers[q.id] === opt ? "#667eea" : "white",
                      color: answers[q.id] === opt ? "white" : "#333",
                      border:
                        answers[q.id] === opt
                          ? "2px solid #667eea"
                          : "2px solid #eee",
                    }}
                  >
                    <span style={{ fontWeight: "700", minWidth: "24px" }}>
                      {opt.toUpperCase()}.
                    </span>
                    {q[`option_${opt}`]}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "white",
            padding: "20px 24px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ fontSize: "15px", color: "#666" }}>
            Answered: {Object.keys(answers).length} / {questions.length}
          </p>
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(answers).length !== questions.length}
            style={{
              background: "#667eea",
              color: "white",
              border: "none",
              padding: "14px 32px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "700",
              opacity:
                Object.keys(answers).length === questions.length ? 1 : 0.6,
            }}
          >
            Submit Quiz
          </button>
        </div>
      </div>
    );
  }

  if (view === "result" && result) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div style={styles.container}>
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            boxShadow: "0 2px 24px rgba(0,0,0,0.1)",
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>
            {getEmoji(result.score, result.total)}
          </div>
          <h1 style={{ fontSize: "28px", color: "#333", marginBottom: "16px" }}>
            Quiz Complete!
          </h1>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "800",
              color: getColor(result.score, result.total),
              marginBottom: "8px",
            }}
          >
            {result.score} / {result.total}
          </div>
          <div
            style={{ fontSize: "20px", color: "#888", marginBottom: "16px" }}
          >
            {pct}%
          </div>
          <div
            style={{
              height: "12px",
              background: "#f0f0f0",
              borderRadius: "6px",
              marginBottom: "24px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: getColor(result.score, result.total),
                borderRadius: "6px",
              }}
            />
          </div>
          <p style={{ fontSize: "16px", color: "#555", marginBottom: "24px" }}>
            {pct === 100
              ? "Perfect score! Outstanding!"
              : pct >= 80
                ? "Excellent work!"
                : pct >= 50
                  ? "Good effort! Keep studying!"
                  : "Keep going! You can do it!"}
          </p>
          <div style={{ textAlign: "left", marginBottom: "24px" }}>
            <h3
              style={{ fontSize: "18px", color: "#333", marginBottom: "16px" }}
            >
              Answer Review
            </h3>
            {questions.map((q, i) => {
              const correct = answers[q.id] === q.correct_answer;
              return (
                <div
                  key={q.id}
                  style={{
                    padding: "12px 16px",
                    background: "#f8f9ff",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    borderLeft: `4px solid ${correct ? "#4caf50" : "#f44336"}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    Q{i + 1}. {q.question}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: correct ? "#2e7d32" : "#c62828",
                    }}
                  >
                    {correct
                      ? "✅ Correct"
                      : `❌ Wrong — Answer: ${q.correct_answer.toUpperCase()}. ${q[`option_${q.correct_answer}`]}`}
                  </p>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setView("list")}
            style={{
              background: "#667eea",
              color: "white",
              border: "none",
              padding: "14px 32px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🧠 Quizzes & Tests</h1>
          <p style={styles.subtitle}>
            {profile && profile.role === "student"
              ? "Take quizzes for your grade"
              : "Create and manage quizzes"}
          </p>
        </div>
        {profile && profile.role === "tutor" && (
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Create Quiz"}
          </button>
        )}
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {showForm && profile && profile.role === "tutor" && (
        <div style={styles.form}>
          <h2 style={styles.formTitle}>Create New Quiz</h2>
          <form onSubmit={handleCreateQuiz}>
            <label style={styles.label}>Quiz Title</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Chapter 3 Test"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              required
            />
            <label style={styles.label}>Subject</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Mathematics"
              value={quizSubject}
              onChange={(e) => setQuizSubject(e.target.value)}
              required
            />
            <label style={styles.label}>Grade</label>
            <select
              style={styles.input}
              value={quizGrade}
              onChange={(e) => setQuizGrade(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
            <h3
              style={{
                fontSize: "16px",
                color: "#333",
                margin: "8px 0 16px",
                borderTop: "1px solid #eee",
                paddingTop: "16px",
              }}
            >
              Questions
            </h3>
            {quizQuestions.map((q, i) => (
              <div
                key={i}
                style={{
                  background: "#f8f9ff",
                  padding: "20px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  border: "1px solid #e0e4ff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#667eea",
                    }}
                  >
                    Question {i + 1}
                  </span>
                  {quizQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(i)}
                      style={{
                        background: "#ffebee",
                        color: "#c62828",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(i, "question", e.target.value)
                  }
                  required
                />
                {["a", "b", "c", "d"].map((opt) => (
                  <div
                    key={opt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "24px",
                        fontWeight: "700",
                        color: "#667eea",
                      }}
                    >
                      {opt.toUpperCase()}.
                    </span>
                    <input
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        fontSize: "14px",
                      }}
                      type="text"
                      placeholder={`Option ${opt.toUpperCase()}`}
                      value={q[`option_${opt}`]}
                      onChange={(e) =>
                        updateQuestion(i, `option_${opt}`, e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
                <label style={styles.label}>Correct Answer</label>
                <select
                  style={styles.input}
                  value={q.correct_answer}
                  onChange={(e) =>
                    updateQuestion(i, "correct_answer", e.target.value)
                  }
                >
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                  <option value="d">D</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              style={{
                background: "#f0f0ff",
                color: "#667eea",
                border: "2px dashed #667eea",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
                width: "100%",
                marginBottom: "16px",
                fontWeight: "600",
              }}
            >
              + Add Question
            </button>
            <button style={styles.submitBtn} type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Quiz"}
            </button>
          </form>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: "48px", marginBottom: "12px" }}>📋</p>
          <p style={{ color: "#666", fontSize: "18px" }}>No quizzes yet</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {quizzes.map((quiz) => {
            const attempted = hasAttempted(quiz.id);
            const score = getScore(quiz.id);
            return (
              <div
                key={quiz.id}
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  borderTop: "4px solid #667eea",
                }}
              >
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
                >
                  <span
                    style={{
                      background: "#f0f0ff",
                      color: "#667eea",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {quiz.subject}
                  </span>
                  <span
                    style={{
                      background: "#f5f5f5",
                      color: "#666",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    Grade {quiz.grade}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "17px",
                    color: "#333",
                    marginBottom: "12px",
                    fontWeight: "600",
                  }}
                >
                  {quiz.title}
                </h3>
                {attempted && score && (
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: getColor(...score.split("/").map(Number)),
                    }}
                  >
                    {getEmoji(...score.split("/").map(Number))} Score: {score}
                  </div>
                )}
                {profile && profile.role === "student" && (
                  <button
                    onClick={() => !attempted && handleStartQuiz(quiz)}
                    disabled={attempted}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: attempted ? "#e0e0e0" : "#667eea",
                      color: attempted ? "#666" : "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: attempted ? "not-allowed" : "pointer",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    {attempted ? "✅ Completed" : "Start Quiz"}
                  </button>
                )}
                {profile && profile.role === "tutor" && (
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#667eea",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Preview Quiz
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto" },
  loading: { textAlign: "center", padding: "40px", fontSize: "18px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: { fontSize: "28px", color: "#333", marginBottom: "4px" },
  subtitle: { fontSize: "14px", color: "#888" },
  addBtn: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },
  backBtn: {
    background: "#f0f0f0",
    color: "#333",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },
  message: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  form: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  formTitle: { fontSize: "18px", color: "#333", marginBottom: "20px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  submitBtn: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "12px 28px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  empty: { textAlign: "center", padding: "60px 20px" },
};
