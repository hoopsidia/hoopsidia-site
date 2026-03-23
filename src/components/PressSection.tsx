"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PRESS_ARTICLES = [
  {
    source: "Le Progrès",
    title: "Hoopsidia, l'influenceur basket, veut ressusciter ce petit terrain au Jardin des Curiosités",
    date: "Mai 2025",
    url: "https://www.leprogres.fr/sport/2025/05/18/un-spot-incroyable-avec-la-plus-belle-vue-de-lyon-hoopsidia-l-influenceur-basket-veut-ressusciter-ce-petit-terrain-a-l-abandon-niche-au-coeur-du-jardin-des-curiosites",
    icon: "/press/leprogres.png",
  },
  {
    source: "Radio Scoop",
    title: "Lyon : passionné de basket, il veut redonner vie à un terrain abandonné",
    date: "Mai 2025",
    url: "https://www.radioscoop.com/infos/lyon-passionne-de-basket-il-veut-redonner-vie-a-un-terrain-abandonne_328188",
    icon: "/press/radioscoop.png",
  },
  {
    source: "Le Dauphiné Libéré",
    title: "Il fait appel aux Lyonnais pour rénover le terrain de basket du Jardin des Curiosités",
    date: "Mai 2025",
    url: "https://www.ledauphine.com/videos/il-fait-appel-aux-lyonnais-pour-renover-le-terrain-de-basket-du-jardin-des-curiosites-xfzm5p5?playlist=qlsrrq",
    icon: "/press/ledauphine.png",
  },
  {
    source: "DNA",
    title: "Il fait appel aux Lyonnais pour rénover le terrain de basket du Jardin des Curiosités",
    date: "Mai 2025",
    url: "https://www.dna.fr/videos/il-fait-appel-aux-lyonnais-pour-renover-le-terrain-de-basket-du-jardin-des-curiosites-xfzm5p5?playlist=qls5qu",
    icon: "/press/dna.png",
  },
  {
    source: "BFM Lyon",
    title: "Un influenceur veut réhabiliter le terrain de basket du Jardin des Curiosités de Lyon",
    date: "Avril 2025",
    url: "https://www.bfmtv.com/lyon/un-spot-vraiment-incroyable-un-influenceur-veut-rehabiliter-le-terrain-de-basket-du-jardin-des-curiosites-de-lyon_AN-202504230418.html",
    icon: "/press/bfmtv.png",
  },
  {
    source: "Merci Le Sport",
    title: "L'influenceur Hoopsidia interpelle le Maire de Lyon sur TikTok !",
    date: "Avril 2025",
    url: "https://www.mercilesport.fr/blog/linfluenceur-hoopsidia-interpelle-le-maire-de-lyon-sur-tik-tok",
    icon: "/press/mercilesport.png",
  },
  {
    source: "OnCourt",
    title: "Hoopsidia x Mega Slam Basketball Hoops",
    date: "Mai 2024",
    url: "https://oncourt.online/fr/blog/basket-ball/hoopsidia-x-mega-slam-basketball-hoops/",
    icon: "/press/oncourt.png",
  },
  {
    source: "Suzuki Presse",
    title: "Des sneakers collector créées pour Suzuki avec Hoopsidia",
    date: "Juillet 2023",
    url: "https://presse.suzuki.fr/des-sneakers-collector-creees-pour-suzuki-avec-hoopsidia-createur-de-contenu-basketball/",
    icon: "/press/suzuki-s.png",
  },
  {
    source: "Saint-Apollinaire",
    title: "Portrait d'Hoopsidia — Magazine municipal",
    date: "Janvier 2023",
    url: "https://www.ville-st-apollinaire.fr/wp-content/uploads/sites/5/2023/01/RC-161-VF_compressed.pdf",
    icon: "/press/saint-apollinaire.png",
  },
  {
    source: "Stramatel",
    title: "Hoopsidia — Pimp My Court",
    date: "Juin 2021",
    url: "https://www.stramatel.com/fr/12738-hoopsidia-pimp-my-court.html",
    icon: "/press/stramatel.png",
  },
  {
    source: "Basket USA",
    title: "Construire son propre terrain de basket, le rêve de gosse de Hoopsidia devenu réalité",
    date: "Décembre 2020",
    url: "https://www.basketusa.com/news/611033/construire-son-propre-terrain-de-basket-le-reve-de-gosse-de-hoopsidia-devenu-realite/",
    icon: "/press/basketusa.png",
  },
  {
    source: "Laysitup",
    title: "À la rencontre d'Hoopsidia, un influenceur basket plein de projets",
    date: "Juillet 2020",
    url: "https://laysitup.com/2020/07/11/a-la-rencontre-dhoopsidia-un-influenceur-basket-plein-de-projets/",
    icon: "/press/laysitup.png",
  },
  {
    source: "LNB.fr",
    title: "Les influenceurs LNB se dévoilent",
    date: "",
    url: "https://www.lnb.fr/fr/article/les-influenceurs-lnb-se-devoilent-13083.html",
    icon: "/press/lnb.png",
  },
  {
    source: "Agence Seven",
    title: "Case study Suzuki HoopsTour & Kellogg's x NBA",
    date: "",
    url: "https://www.agence-seven.fr/influence-et-creation-de-contenus",
    icon: "/press/seven.png",
  },
];

export default function PressSection() {
  const t = useTranslations("press");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="press" className="bg-black py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase text-white">
            {t("title")}
          </h2>
          <p className="mt-3 text-white/50">{t("subtitle")}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESS_ARTICLES.map((article, i) => (
            <motion.a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass rounded-xl p-5 flex items-start gap-4 hover:bg-white/[0.08] transition-colors group"
            >
              {/* Logo carré liquid glass style app icon */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-[22%] relative overflow-hidden flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.1) 100%)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%)" }} />
                <img
                  src={article.icon}
                  alt={article.source}
                  className="w-full h-full object-cover relative z-10"
                />
              </div>

              {/* Contenu */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-orange">
                    {article.source}
                  </span>
                  {article.date && (
                    <span className="text-[10px] text-white/30">
                      {article.date}
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-sm font-bold text-white/80 group-hover:text-white transition-colors leading-snug uppercase">
                  {article.title}
                </h3>
                <div className="mt-auto flex items-center gap-1 text-orange/60 group-hover:text-orange transition-colors">
                  <span className="text-xs font-bold uppercase">{t("read")}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="translate-x-0 group-hover:translate-x-1 transition-transform">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
