import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function ReviewSubmissions() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (!error) setSubmissions(data);
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Coursework Submissions</h1>

      <div className="bg-white shadow rounded p-4">
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Student ID</th>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Submitted At</th>
                <th className="p-2 border">File</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="p-2 border">{s.student_id}</td>
                  <td className="p-2 border">{s.title}</td>
                  <td className="p-2 border">
                    {new Date(s.submitted_at).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    <a
                      href={s.file_url}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Download
                    </a>
                  </td>
                  <td className="p-2 border">
                    <a
                      href={`/grade/${s.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Grade
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
