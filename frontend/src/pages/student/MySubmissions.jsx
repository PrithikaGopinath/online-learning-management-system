import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", "12345678"); // replace with logged-in user ID

      setSubmissions(data);
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Submissions</h1>

      {submissions.length === 0 ? (
        <p>You have not submitted any coursework yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white shadow rounded p-4">
              <p>
                <strong>Title:</strong> {s.title}
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(s.submitted_at).toLocaleString()}
              </p>
              <p>
                <strong>Grade:</strong> {s.grade || "Not graded yet"}
              </p>
              <p>
                <strong>Feedback:</strong> {s.feedback || "No feedback yet"}
              </p>
              <a
                href={s.file_url}
                target="_blank"
                className="text-blue-600 underline"
              >
                Download File
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
