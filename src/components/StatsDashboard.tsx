"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PLACEHOLDER_IG_STATS } from "@/lib/constants";

function StatCard({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-2xl sm:text-3xl font-heading font-bold text-orange">{value}</div>
      <div className="mt-1 text-xs sm:text-sm text-white/70">{label}</div>
    </motion.div>
  );
}

export default function StatsDashboard() {
  const t = useTranslations("stats");
  const [stats, setStats] = useState(PLACEHOLDER_IG_STATS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetch("/api/instagram")
      .then((res) => res.json())
      .then((data) => {
        if (!data.isPlaceholder) {
          setStats(data);
          setIsLive(true);
        }
      })
      .catch(() => {});
  }, []);

  const chartData = stats.followerHistory.map((d) => ({
    date: d.date,
    followers: d.followers,
  }));

  return (
    <section id="stats" className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase">
            {t("title")}
          </h2>
          <p className="mt-2 text-white/70 text-sm">{t("subtitle")}</p>
        </div>

        {/* Stats band */}
        <div className="glass rounded-2xl p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            value={`${stats.engagementRate}%`}
            label={t("engagement")}
            delay={0}
          />
          <StatCard
            value={stats.views30d >= 1_000_000 ? `${(stats.views30d / 1_000_000).toFixed(1)}M` : `${(stats.views30d / 1_000).toFixed(1)}K`}
            label={t("views30d")}
            delay={0.1}
          />
          <StatCard
            value={stats.followers.toLocaleString("fr-FR")}
            label={t("followers")}
            delay={0.2}
          />
          <StatCard
            value={`${(stats.averageReach / 1_000).toFixed(0)}K`}
            label={t("reach")}
            delay={0.3}
          />
          </div>
        </div>

        {/* Demographics + Chart — single row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Gender - Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-4 flex flex-col"
          >
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t("gender")}
            </h3>
            {(() => {
              const mf = stats.demographics.gender.filter(g => g.label === "M" || g.label === "F");
              const totalMF = mf.reduce((s, g) => s + g.value, 0);
              const genderData = mf.map(g => ({
                ...g,
                percent: totalMF > 0 ? Math.round((g.value / totalMF) * 100) : g.percent,
              }));
              return (
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <div className="w-24 h-24 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={45}
                          strokeWidth={0}
                        >
                          {genderData.map((g) => (
                            <Cell key={g.label} fill={g.label === "M" ? "#FC8D33" : "#ffffff30"} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1">
                    {genderData.map((g) => (
                      <div key={g.label} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.label === "M" ? "#FC8D33" : "rgba(255,255,255,0.2)" }} />
                        <span className="text-xs text-white/70">{g.label === "M" ? t("male") : t("female")}</span>
                        <span className="text-xs text-orange font-bold ml-auto">{g.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>

          {/* Ages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-4 flex flex-col"
          >
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t("ages")}
            </h3>
            <div className="flex-1 flex flex-col justify-center space-y-2">
              {[...stats.demographics.ages].sort((a, b) => parseInt(a.label) - parseInt(b.label)).map((a) => (
                <div key={a.label}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-white/70">{a.label}</span>
                    <span className="text-orange font-bold">{a.percent}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange rounded-full"
                      style={{ width: `${(a.percent / Math.max(...stats.demographics.ages.map(x => x.percent))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-4 flex flex-col"
          >
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t("cities")}
            </h3>
            <div className="flex-1 flex flex-col justify-center space-y-2">
              {stats.demographics.cities.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/70 truncate">{c.label.split(",")[0]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange rounded-full"
                        style={{ width: `${c.percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-orange font-bold w-8 text-right">{c.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-4 flex flex-col"
          >
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t("growthTitle")}
            </h3>
            <div className="flex-1 min-h-[10rem]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FC8D33" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FC8D33" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff30"
                    tick={{ fill: "#ffffff50", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#ffffff30"
                    tick={{ fill: "#ffffff50", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                    domain={["dataMin - 100", "dataMax + 100"]}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "transparent",
                      backdropFilter: "blur(40px) saturate(1.6) brightness(1.1)",
                      WebkitBackdropFilter: "blur(40px) saturate(1.6) brightness(1.1)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: 12,
                      color: "#fff",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.2)",
                    }}
                    formatter={(value) => [
                      `${(Number(value) / 1000).toFixed(1)}K`,
                      "Followers",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="followers"
                    stroke="#FC8D33"
                    strokeWidth={2}
                    fill="url(#orangeGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {!isLive && (
              <p className="mt-2 text-[10px] text-white/30 text-center">
                {t("placeholder")}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
