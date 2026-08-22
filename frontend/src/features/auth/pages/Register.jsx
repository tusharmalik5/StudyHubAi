import React, { useState } from "react";
import { useAuth } from "../hook/useAuth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const { handleRegister, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("clicked")
    const success = await handleRegister({ email, username, password });
    if (success) {
      setIsRegistered(true);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center">
          Registration successful! Please check your email to verify your account.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-96 p-6 flex flex-col gap-4 border rounded-lg"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 active:scale-95 rounded disabled:opacity-50"
        >
          {loading ? "Registering..." : "Create Account"}
        </button>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <a href="/login" className="text-center text-blue-500">
          Already have an account? Login
        </a>
      </form>
    </div>
  );
}