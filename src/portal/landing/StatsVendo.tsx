/**
 * Trust bar under the hero (Jiro "Stats & Metrics Vendo", Appendix C), recoloured.
 * Live counts (ambassadors, verified sales) aren't readable by anonymous visitors under the
 * current RLS, and RLS stays as it is, so the three columns state facts instead of numbers.
 * Gold icon chips replace Vendo's avatar photos.
 */
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, BookOpen, Briefcase, LayoutDashboard, Wallet } from "lucide-react";

function Chip({ children, first = false }: { children: ReactNode; first?: boolean }) {
  return (
    <span
      className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-joat-surface bg-joat-gold text-joat-black [&_svg]:h-5 [&_svg]:w-5 ${first ? "" : "-ml-4.5"}`}
    >
      {children}
    </span>
  );
}

const value =
  "font-gilda text-[34px] font-normal leading-[1.1] text-joat-cream mb-3.5 sm:text-[38px]";
const caption = "text-[17px] leading-[1.6] text-joat-body";
const strong = "font-semibold text-joat-cream";
const column =
  "flex flex-1 flex-col items-center p-10 text-center transition-colors duration-300 hover:bg-joat-black-alt/50 md:py-16";

export function StatsVendo({ className = "" }: { className?: string }) {
  return (
    <section aria-label="The program at a glance" className={`w-full bg-joat-black ${className}`}>
      <div className="w-full px-6 pb-[90px] pt-[56px] md:px-12">
        <motion.div
          id="metrics-bar"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="group/bar mx-auto flex w-full max-w-[1340px] flex-col items-stretch overflow-hidden rounded-[32px] border border-joat-border bg-joat-surface md:flex-row"
        >
          {/* Column 1 — toggle */}
          <div className={`${column} border-b border-joat-border md:border-b-0 md:border-r`}>
            <div className="mb-7" aria-hidden>
              <div className="relative box-border flex h-[32px] w-[64px] items-center rounded-full bg-joat-gold p-[3.5px]">
                <motion.div
                  animate={{ x: [0, 28, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-joat-black"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-joat-gold)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </motion.div>
              </div>
            </div>
            <p className={value}>Free to join</p>
            <p className={`${caption} max-w-[220px]`}>
              No purchase required,
              <br />
              and <span className={strong}>no paid upgrades</span>
            </p>
          </div>

          {/* Column 2 — three chips */}
          <div className={`${column} border-b border-joat-border md:border-b-0 md:border-r`}>
            <div className="mb-7 flex items-center" aria-hidden>
              <Chip first>
                <Briefcase />
              </Chip>
              <Chip>
                <BookOpen />
              </Chip>
              <Chip>
                <LayoutDashboard />
              </Chip>
            </div>
            <p className={value}>2 brands, 1 portal</p>
            <p className={`${caption} max-w-[240px]`}>
              <span className={strong}>JOAT Global</span> and
              <br />
              <span className={strong}>Amare's Big Planet</span>
            </p>
          </div>

          {/* Column 3 — two chips */}
          <div className={column}>
            <div className="mb-7 flex items-center" aria-hidden>
              <Chip first>
                <BadgeCheck />
              </Chip>
              <Chip>
                <Wallet />
              </Chip>
            </div>
            <p className={value}>Paid on verified sales only</p>
            <p className={`${caption} max-w-[260px]`}>
              <span className={strong}>
                Single-level <span className="font-normal text-joat-body">&amp;</span>
              </span>
              <br />
              no rewards for recruiting
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
