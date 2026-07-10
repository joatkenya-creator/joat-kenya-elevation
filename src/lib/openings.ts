// ─── Careers: open roles data model ──────────────────────────────────────────
// Single source of truth for the careers board. Each opening renders a
// Deloitte-style detail view (Job Description → Main purpose + What you'll do;
// Qualifications → Required, Behavioural, Technical) and feeds the application
// form, which writes to the Supabase `applications` table and uploads files to
// the `joatkenya-applications-and-bot` bucket, into a folder named after the
// job title (see `folderFor`).
//
// NOTE: replace the seeded descriptions below with the live Majobo Kenya job
// content. The titles match real folders already in the storage bucket.

export const APPLY_EMAIL = "joatkenya120@gmail.com";
export const APPLICATIONS_BUCKET = "joatkenya-applications-and-bot";

export type Opening = {
  slug: string;
  title: string;
  category: string;
  location: string;
  type: "Full-time" | "Contract" | "Internship" | "Part-time";
  pay?: string;
  postedNote?: string;
  trades: string[];
  mainPurpose: string;
  whatYouWillDo: string[];
  requiredQualifications: string[];
  behaviouralCompetencies: string[];
  technicalCompetencies: string[];
};

/**
 * Storage folder for a job's uploaded files. Mirrors the existing bucket
 * convention (e.g. "Software Developer" → "Software-Developer/"). Files for a
 * role are uploaded under this prefix, which Supabase creates on first upload.
 */
export function folderFor(title: string): string {
  return title
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Shared "about the company" block, shown at the top of every job detail view
// (mirrors Deloitte's "About Deloitte" / hiring-unit section).
export const ABOUT_JOAT =
  "J.O.A.T. Kenya (Jack of All Trades) is a digital innovation studio. " +
  "We build software and digital products, run AI-driven marketing, produce media and animation, " +
  "and create children's digital education, delivering everything in-house from Thindigua, Kiambu " +
  "for clients across Kenya, East Africa and beyond. You'll join a multi-skilled team that ships " +
  "real products used by thousands of people.";

export const openings: Opening[] = [
  {
    slug: "dancers",
    title: "Dancers",
    category: "Media & Performance",
    location: "Thindigua, Kiambu · Studio & On-location",
    type: "Full-time",
    postedNote: "Posted July 2026 · Open",
    trades: [
      "Dance",
      "Choreography",
      "Stage Performance",
      "On-camera Performance",
      "Working with Children",
      "Teamwork",
    ],
    mainPurpose:
      "Bring music and movement to life for children as a performer with Amares Big Planet, JOAT Kenya's children's entertainment and digital education brand. We're looking for energetic, creative and confident dancers who love performing and inspiring children through music and movement. Solo dancers and dance groups are all welcome to apply.",
    whatYouWillDo: [
      "Perform high-energy, creative dance routines for children, both live and on camera.",
      "Inspire and engage young audiences — including children on the autism spectrum — through music and movement.",
      "Bring positive energy, confidence and creativity to every rehearsal and performance.",
      "Collaborate with the team on choreography, themes and content ideas.",
      "Represent Amares Big Planet professionally at shoots, events and performances.",
    ],
    requiredQualifications: [
      "Strong dance skills as a solo performer or as part of a dance crew or group.",
      "A genuine passion for working with children, including children on the autism spectrum.",
      "Confidence performing on stage and in front of the camera.",
      "Commitment, reliability, teamwork and consistently positive energy.",
      "Formal dance training is a plus, but talent, attitude and energy matter most.",
    ],
    behaviouralCompetencies: [
      "Energetic, creative and confident.",
      "Patient, warm and encouraging with children.",
      "Reliable, committed and a dependable team player.",
      "Brings positive energy to every rehearsal and performance.",
    ],
    technicalCompetencies: [
      "Dance and choreography across one or more styles.",
      "Comfortable performing to a live audience and to camera.",
      "Able to learn and adapt routines quickly for different themes.",
    ],
  },
  {
    slug: "website-services-sales-person",
    title: "Website Services Sales Person",
    category: "Sales & Business Development",
    location: "Thindigua, Kiambu Road · Field + Office",
    type: "Full-time",
    pay: "Competitive compensation + commission",
    postedNote: "Posted 4 June 2026 · Open",
    trades: ["Sales", "Client Relations", "Communication", "Lead Generation"],
    mainPurpose:
      "Help Kenyan businesses build, maintain, secure and grow their online presence by selling JOAT's website and digital services, building strong client relationships and being rewarded with a monthly stipend, attractive commission and real career growth.",
    whatYouWillDo: [
      "Pitch JOAT's website design, hosting, maintenance and security services to businesses across Nairobi, Kiambu and beyond.",
      "Generate leads, follow up with prospects and convert them into paying clients.",
      "Build strong, lasting relationships with clients and understand their needs.",
      "Recommend the right package for each business and close deals.",
      "Meet and exceed monthly sales targets to earn commission on every successful deal.",
      "Represent JOAT professionally at meetings, pitches and networking events.",
    ],
    requiredQualifications: [
      "Proven experience in sales, business development or a client-facing role. Selling digital or website services is an added advantage.",
      "Excellent communication and negotiation skills in English and Kiswahili.",
      "Confident and persuasive, comfortable pitching to business owners and decision-makers.",
      "Self-driven and motivated by targets and commission.",
      "A certificate, diploma or degree in Sales, Marketing or Business is an advantage (the right attitude and track record matter most).",
    ],
    behaviouralCompetencies: [
      "Confident, persuasive communicator.",
      "Results-driven and resilient under targets.",
      "Strong relationship builder and good listener.",
      "Reliable, honest and professional.",
    ],
    technicalCompetencies: [
      "Understanding of websites and digital services (domains, hosting, maintenance, security), or the drive to learn them fast.",
      "Lead tracking and basic pipeline / CRM management.",
      "Comfortable using WhatsApp, email and social platforms for outreach.",
    ],
  },
  {
    slug: "technical-support-troubleshooting",
    title: "Technical Support & Troubleshooting",
    category: "Tech & Software",
    location: "Thindigua, Kiambu · On-site",
    type: "Full-time",
    postedNote: "Posted June 2026 · Open",
    trades: ["IT Support", "Networking", "Troubleshooting", "Web Maintenance", "Cybersecurity"],
    mainPurpose:
      "Keep JOAT's systems, websites and clients running smoothly by providing hands-on technical support and troubleshooting across software, hardware and networks. Open to students on attachment and recent graduates ready to learn fast.",
    whatYouWillDo: [
      "Provide technical support and troubleshooting for staff and clients.",
      "Assist in website management and updates.",
      "Support software, hardware and network maintenance.",
      "Participate in system testing and technology projects.",
      "Assist with cybersecurity and data management tasks.",
    ],
    requiredQualifications: [
      "Pursuing or recently completed a Diploma or Degree in Information Technology, Computer Science, Software Engineering or a related field.",
      "Basic knowledge of computer systems, networking and software applications.",
      "Knowledge of web development, programming or database management is an added advantage.",
      "Strong problem-solving and analytical skills.",
    ],
    behaviouralCompetencies: [
      "Patient and helpful when assisting non-technical users.",
      "Reliable, proactive and eager to learn.",
      "Calm and methodical under pressure.",
      "A dependable team player.",
    ],
    technicalCompetencies: [
      "Computer systems, networking and software troubleshooting.",
      "Website management and updates (CMS and basic web technologies).",
      "Familiarity with cybersecurity basics and data management.",
    ],
  },
  {
    slug: "accounting-administrative-officer",
    title: "Accounting & Administrative Officer",
    category: "Finance & Administration",
    location: "Thindigua, Kiambu · On-site",
    type: "Full-time",
    postedNote: "Posted 2 June 2026 · Open",
    trades: ["Bookkeeping", "Microsoft Office", "Payroll", "Procurement", "Record Keeping"],
    mainPurpose:
      "Keep JOAT's office and finances running smoothly, managing day-to-day administration while maintaining accurate financial records and supporting bookkeeping, payroll and procurement.",
    whatYouWillDo: [
      "Manage office operations and administrative tasks.",
      "Maintain financial records and assist in bookkeeping.",
      "Prepare invoices, receipts and expense reports.",
      "Support payroll and procurement processes.",
      "Ensure proper filing and documentation of company records.",
    ],
    requiredQualifications: [
      "Knowledge of accounting principles and bookkeeping.",
      "Proficiency in Microsoft Office and accounting software (e.g. QuickBooks or Sage).",
      "A Diploma or Degree in Accounting, Business Administration or Commerce; CPA (Part I/II) is an added advantage.",
      "Strong organisational and analytical skills.",
      "High level of integrity and attention to detail.",
    ],
    behaviouralCompetencies: [
      "High integrity and discretion with sensitive information.",
      "Detail-oriented and well organised.",
      "Dependable, proactive and deadline-aware.",
      "Clear, professional communicator.",
    ],
    technicalCompetencies: [
      "Bookkeeping and financial record management.",
      "Accounting software and Microsoft Excel.",
      "Invoicing, payroll and procurement support.",
    ],
  },
  {
    slug: "virtual-assistant",
    title: "Virtual Assistant",
    category: "Administration & Support",
    location: "Remote",
    type: "Full-time",
    pay: "Competitive compensation",
    postedNote: "Posted 10 July 2026 · Open",
    trades: [
      "Virtual Assistance",
      "Administrative Support",
      "Communication",
      "Data Entry",
      "Google Workspace",
      "Microsoft Office",
    ],
    mainPurpose:
      "Support JOAT Kenya's team remotely by managing emails, calendars and day-to-day administrative work, helping the business stay organised, responsive and efficient while being part of something impactful.",
    whatYouWillDo: [
      "Manage emails, calendars and appointments.",
      "Respond to client inquiries professionally and promptly.",
      "Perform data entry and maintain accurate records.",
      "Conduct online research and prepare reports.",
      "Prepare documents, presentations and spreadsheets.",
      "Schedule and manage meetings.",
      "Coordinate tasks with team members and track project progress.",
      "Organize digital files and company documentation.",
      "Assist with social media scheduling and other administrative tasks as assigned.",
    ],
    requiredQualifications: [
      "Excellent communication skills in English.",
      "Strong organizational and time-management skills.",
      "Proficiency in Google Workspace and Microsoft Office.",
      "Ability to multitask and work independently.",
      "High attention to detail and problem-solving skills.",
      "Reliable internet connection and access to a computer.",
      "Previous experience as a Virtual Assistant or Administrative Assistant is an added advantage.",
    ],
    behaviouralCompetencies: [
      "Highly organised, self-motivated and reliable.",
      "Clear, professional communicator.",
      "Proactive problem-solver who works well independently.",
      "Trustworthy with confidential information and company documentation.",
    ],
    technicalCompetencies: [
      "Google Workspace and Microsoft Office proficiency.",
      "Data entry, record-keeping and report preparation.",
      "Calendar, email and meeting-scheduling tools.",
    ],
  },
];
