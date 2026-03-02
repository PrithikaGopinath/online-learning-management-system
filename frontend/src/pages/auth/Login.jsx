import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { BookOpen } from "lucide-react";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail(newRole === "student" ? "student@example.com" : "tutor@example.com");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // TEMPORARY BYPASS FOR TESTING
    if (email === "tutor@example.com" || email === "student@example.com") {
      localStorage.setItem("temp_role", role);
      setTimeout(() => {
        window.location.href = role === "tutor" ? "/dashboard/tutor" : "/dashboard/student";
      }, 500);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = role === "tutor" ? "/dashboard/tutor" : "/dashboard/student";
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          LearnHub VLE
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your learning portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">

          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            <button
              onClick={() => handleRoleChange("student")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "student" ? "bg-white shadow-sm text-indigo-700" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Student
            </button>
            <button
              onClick={() => handleRoleChange("tutor")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "tutor" ? "bg-white shadow-sm text-indigo-700" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Tutor
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
              >
                {loading ? "Signing in..." : `Log in as ${role === "student" ? "Student" : "Tutor"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
