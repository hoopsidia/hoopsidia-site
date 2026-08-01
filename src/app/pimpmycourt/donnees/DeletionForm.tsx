"use client";

import { useState } from "react";

export default function DeletionForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/pimpmycourt/suppression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setDone(true); // always confirm, regardless of whether the email existed
  }

  if (done) {
    return <p className="mt-2 text-sm text-white/70">Si des données sont associées à cet email, elles ont été supprimées.</p>;
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ton email"
        className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange"
      />
      <button type="submit" className="rounded-full bg-orange text-black px-5 py-2 font-heading font-bold uppercase text-sm hover:bg-orange-light">
        Supprimer
      </button>
    </form>
  );
}
