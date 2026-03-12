import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { ArrowLeft, FileText } from "lucide-react";

export default function GradeSubmission() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSubmission();
  }, []);

  async function loadSubmission() {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) {
      setSubmission(data);
      setGrade(data.grade || "");
      setFeedback(data.feedback || "");
    }
  }

  async function saveGrade() {
    const { error } = await supabase
      .from("submissions")
      .update({
        grade,
        feedback,
        graded_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (!error) {
      setMessage("Grade saved successfully!");
      loadSubmission();
    }
  }

  if (!submission) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading submission...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Back Button */}
      <Link
        to="/review-submissions"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Submissions
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Grade Coursework Submission
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      {/* Submission Details */}
      <div className="bg-white shadow rounded-xl border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Submission Details</h2>

        <p className="mb-2">
          <strong>Student ID:</strong> {submission.student_id}
        </p>
        <p className="mb-2">
          <strong>Title:</strong> {submission.title}
        </p>
        <p className="mb-2">
          <strong>Submitted:</strong>{" "}
          {new Date(submission.submitted_at).toLocaleString()}
        </p>

        {submission.graded_at && (
          <p className="mb-4 text-sm text-gray-500">
            Last graded: {new Date(submission.graded_at).toLocaleString()}
          </p>
        )}

        <a
          href={submission.file_url}
          target="_blank"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FileText className="h-5 w-5 mr-2" />
          Download File
        </a>
      </div>

      {/* Grading Form */}
      <div className="bg-white shadow rounded-xl border p-6 space-y-6">
        <div>
          <label className="block font-semibold mb-1">Grade</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="e.g., A, B+, 85%"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Feedback</label>
          <textarea
            className="w-full border p-2 rounded h-32"
            placeholder="Write feedback for the student..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
        </div>

        <button
          onClick={saveGrade}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {submission.grade ? "Update Grade" : "Save Grade"}
        </button>
      </div>
    </div>
  );
}
