import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function SubmitCoursework() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !file) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // 1. Upload file to Supabase Storage
      const filePath = `coursework/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("coursework-submissions")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from("coursework-submissions")
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // 3. Insert metadata into Supabase table
      const { error: insertError } = await supabase.from("submissions").insert([
        {
          title,
          description,
          file_url: fileUrl,
          student_id: "12345678", // replace with logged-in user ID
          submitted_at: new Date(),
        },
      ]);

      if (insertError) throw insertError;

      setMessage("Coursework submitted successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Error submitting coursework. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Submit Coursework</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded p-6 space-y-5"
      >
        <div>
          <label className="block font-semibold mb-1">
            Coursework Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="e.g., Software Engineering Coursework 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            className="w-full border p-2 rounded h-28"
            placeholder="Add any notes for the tutor..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div>
          <label className="block font-semibold mb-1">
            Upload File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            className="w-full border p-2 rounded"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />

          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <strong>{file.name}</strong>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-5 py-2 rounded`}
        >
          {loading ? "Submitting..." : "Submit Coursework"}
        </button>
      </form>
    </div>
  );
}
