"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function ContactForm() {
  const t = useTranslations("contact");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot check
    if (data.get("website")) {
      setStatus("success");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="bg-black text-white py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase">
              {t("title")}
            </h2>
            <p className="mt-3 text-white/50">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  {t("name")}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl glass-subtle text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  {t("email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl glass-subtle text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1.5">
                  {t("company")}
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  className="w-full px-4 py-3 rounded-xl glass-subtle text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
                  {t("subject")}
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl glass-subtle text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                {t("message")}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full px-4 py-3 rounded-xl glass-subtle text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-orange hover:bg-orange-dark text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-60"
            >
              {status === "sending" ? t("sending") : t("send")}
            </button>

            {status === "success" && (
              <p className="text-center text-green-600 text-sm">{t("success")}</p>
            )}
            {status === "error" && (
              <p className="text-center text-red-600 text-sm">{t("error")}</p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
