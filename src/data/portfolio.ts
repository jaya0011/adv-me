export const profile = {
  name: "Jaya Arora",
  firstName: "Jaya",
  lastName: "Arora",
  title: "Full-Stack Developer",
  roles: ["Full-Stack Developer", "Freelance Developer", "Web & Mobile App Developer"],
  location: "Amritsar, Punjab, India",
  email: "jaya.arora.tech@gmail.com",
  github: "https://github.com/jaya0011",
  linkedin: "https://www.linkedin.com/in/jaya-arora-81b96a376/",
  instagram: "https://www.instagram.com/jayaonloop",
  instagramHandle: "@jayaonloop",
  summary: [
    "I'm Jaya, a full-stack developer from Amritsar, Punjab. I completed my Bachelor of Computer Applications and I'm now pursuing an MSc in Computer Science at Guru Nanak Dev University.",
    "As a freelance developer I build websites, web apps, Android and iOS apps, and custom digital tools for businesses: custom-coded sites, WordPress builds, ecommerce platforms and custom PHP plugins.",
    "I work across the whole stack: frontend, backend, API integrations, databases and responsive UI. I like taking a rough idea, working through the technical problems, and turning it into a product people actually use.",
  ],
  goal: "I want to build reliable, user-friendly, scalable applications that help businesses build and grow their presence online.",
};

export const education = [
  {
    degree: "MSc in Computer Science",
    school: "Guru Nanak Dev University (GNDU)",
    status: "In progress",
    current: true,
  },
  {
    degree: "Bachelor of Computer Applications (BCA)",
    school: "Undergraduate degree",
    status: "Completed",
    current: false,
  },
];

export const strengths = [
  "Full-stack application development",
  "Problem-solving & debugging",
  "Responsive, user-friendly interfaces",
  "APIs & databases",
  "Custom business solutions",
  "Learning new technologies",
  "Independent freelance delivery",
  "Turning requirements into features",
];

export type SkillGroup = {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend",
    emoji: "🎨",
    blurb: "Fast, responsive interfaces that feel good to use.",
    skills: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React.js", "Next.js", "Tailwind CSS", "Responsive design"],
  },
  {
    id: "backend",
    label: "Backend",
    emoji: "⚙️",
    blurb: "APIs and server logic that hold the product together.",
    skills: ["Node.js", "NestJS", "PHP", "REST APIs", "API integration", "Server-side apps"],
  },
  {
    id: "data",
    label: "Data",
    emoji: "🗄️",
    blurb: "Schemas and queries designed for real workloads.",
    skills: ["PostgreSQL", "Drizzle ORM", "Database design", "Data integration"],
  },
  {
    id: "mobile",
    label: "Mobile",
    emoji: "📱",
    blurb: "One codebase that ships to both stores.",
    skills: ["React Native", "Expo", "Android", "iOS"],
  },
  {
    id: "cms",
    label: "CMS & Commerce",
    emoji: "🛒",
    blurb: "Stores and content sites that clients can run themselves.",
    skills: ["WordPress", "Custom PHP plugins", "Headless WordPress", "Ecommerce", "Cart & checkout", "Order management"],
  },
  {
    id: "toolkit",
    label: "Toolkit",
    emoji: "🧰",
    blurb: "The integrations real products need.",
    skills: ["Third-party APIs", "Auth & RBAC", "Payment gateways", "Email & notifications", "PDF generation", "Git & GitHub"],
  },
];

export const services = [
  { title: "Full-stack websites", desc: "Frontend, backend and database, built and launched by one developer.", icon: "Layers" },
  { title: "Custom web apps", desc: "Dashboards, portals and SaaS tools shaped around how your team works.", icon: "AppWindow" },
  { title: "Android & iOS apps", desc: "Cross-platform mobile apps built with React Native and Expo.", icon: "Smartphone" },
  { title: "WordPress websites", desc: "Content sites your team can update without calling a developer.", icon: "Newspaper" },
  { title: "Custom PHP plugins", desc: "WordPress features that no off-the-shelf plugin provides.", icon: "Puzzle" },
  { title: "Ecommerce stores", desc: "Products, cart, checkout, payments and order tracking.", icon: "ShoppingBag" },
  { title: "API development", desc: "REST APIs, plus integrations with the services you already use.", icon: "Cable" },
  { title: "Database design", desc: "Clean schemas, migrations and queries that keep up as you grow.", icon: "Database" },
  { title: "Frontend & backend", desc: "Need one side of the stack? I can take that on.", icon: "SplitSquareHorizontal" },
  { title: "Business & portfolio sites", desc: "A clear, fast website that presents your work well.", icon: "BriefcaseBusiness" },
  { title: "Maintenance & features", desc: "Fixes, upgrades and new features for an existing product.", icon: "Wrench" },
];

export type Category = "Web Apps" | "SaaS" | "Ecommerce" | "Websites" | "Mobile" | "AI";

export type Project = {
  id: string;
  name: string;
  type: string;
  tagline: string;
  url?: string;
  categories: Category[];
  overview: string;
  features: string[];
  roadmap?: string[];
  tech: string[];
  contribution?: string;
  colors: [string, string];
  icon: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "dhawada",
    name: "Dhawada Jewellery",
    type: "Jewellery Ecommerce",
    tagline: "Online jewellery shopping with 3D viewing, a Next.js frontend and a WordPress backend",
    url: "https://dhawada.com/",
    categories: ["Ecommerce", "Web Apps"],
    overview:
      "An ecommerce platform for buying jewellery online. A modern Next.js frontend sits on a WordPress backend, with a custom PHP plugin for the features this project needed.",
    features: [
      "Product categories, search and gemstone filters",
      "Product pages with image zoom and 3D viewing",
      "Cart, wishlist, coupons and promotions",
      "Checkout with payment integration",
      "Customer accounts, saved addresses and order history",
      "DHL Express shipping integration and tracking",
      "Quote requests and call booking",
      "Language and currency switching",
      "Email notifications",
    ],
    tech: ["Next.js 15", "React 19", "Tailwind CSS", "Framer Motion", "Three.js", "WordPress", "PHP", "Nodemailer", "DHL Express"],
    colors: ["#e8c26a", "#7c3aed"],
    icon: "Gem",
    featured: true,
  },
  {
    id: "globalhrbook",
    name: "Global HRBook",
    type: "HRMS · Web + Mobile",
    tagline: "More than 20 HR modules, on the web and on mobile",
    url: "https://app.globalhrbook.com/",
    categories: ["SaaS", "Web Apps", "Mobile"],
    overview:
      "An HR management platform that helps organisations manage employee information and day-to-day HR work, on the web and on mobile.",
    features: [
      "20+ HR modules",
      "Employee management",
      "Attendance, leave and holiday management",
      "Payroll workflows",
      "Expense management",
      "Role-based access for admins, HR, managers and employees",
      "Admin dashboards and backend APIs",
      "Mobile app support",
      "Access control by subscription plan",
    ],
    tech: ["NestJS", "Next.js", "Expo React Native", "Drizzle ORM", "PostgreSQL"],
    colors: ["#22d3ee", "#2563eb"],
    icon: "Users",
    featured: true,
  },
  {
    id: "mendingminds",
    name: "MendingMinds",
    type: "Therapy & Wellness App",
    tagline: "Connects clients, therapists and admins in one place",
    url: "https://mendingmind.in/",
    categories: ["Web Apps"],
    overview:
      "A therapy platform that connects clients, therapists and administrators, and handles therapy services and appointments.",
    features: [
      "Appointment booking",
      "Therapist availability and leave management",
      "Client check-ins and notes",
      "Individual and couple therapy plans",
      "Therapy plan PDF generation",
      "Session and package-based pricing",
      "Client and therapist management",
      "Auth, payments, email and file uploads",
    ],
    tech: ["Node.js", "JavaScript", "Vite", "Tailwind CSS", "jsPDF", "Payment & messaging integrations"],
    colors: ["#a78bfa", "#f472b6"],
    icon: "HeartHandshake",
    featured: true,
  },
  {
    id: "firstrank",
    name: "First Rank",
    type: "School Management SaaS",
    tagline: "Multi-tenant edtech for schools, teachers and parents",
    url: "https://firstrank.zlaark.com/",
    categories: ["SaaS", "AI"],
    overview:
      "An edtech platform built around school management, academic workflows, school discovery, and connected experiences for teachers and parents.",
    features: [
      "School management",
      "Multi-tenant architecture",
      "Separate workspaces for teachers and parents",
      "School discovery",
      "Subscription and billing workflows",
      "Lesson plans, question papers and homework",
    ],
    roadmap: ["AI-assisted education features", "OCR and retrieval-augmented generation (RAG)", "Mobile billing integrations"],
    tech: ["TypeScript", "React", "Next.js"],
    colors: ["#34d399", "#0ea5e9"],
    icon: "GraduationCap",
  },
  {
    id: "brobuzz",
    name: "BroBuzz",
    type: "AI Virtual Try-On",
    tagline: "Try on hairstyles and beards before the barber does",
    categories: ["AI", "Web Apps"],
    overview:
      "An app for trying different hairstyles and beard styles virtually, so users can preview a new look before committing to it.",
    features: [
      "Virtual hairstyle exploration",
      "Beard-style try-on",
      "Easy-to-use preview interface",
      "Browse grooming styles digitally",
    ],
    tech: ["Next.js", "AI image processing"],
    colors: ["#f97316", "#ef4444"],
    icon: "Scissors",
  },
  {
    id: "gessure",
    name: "Gessure",
    type: "Professional Networking",
    tagline: "A platform for professional profiles and career connections",
    url: "https://app.gessure.in/",
    categories: ["Web Apps"],
    overview:
      "A professional networking platform for career connections and professional engagement.",
    features: ["Professional profiles", "Networking features", "Career connections"],
    tech: [],
    colors: ["#6366f1", "#06b6d4"],
    icon: "Network",
  },
  {
    id: "mrveg",
    name: "Mr.Veg",
    type: "WordPress Website",
    tagline: "Spice products and a smart vending-machine franchise",
    url: "https://mrveg.in/",
    categories: ["Websites"],
    overview:
      "A WordPress website that presents food products, including spices, and explains a smart vending-machine franchise offer.",
    features: [
      "Product-focused pages",
      "Spice and food product information",
      "Product category presentation",
      "Smart vending-machine information",
      "Franchise content",
      "Content managed in WordPress",
    ],
    tech: ["WordPress"],
    colors: ["#84cc16", "#f59e0b"],
    icon: "Leaf",
  },
  {
    id: "dentistpitampura",
    name: "Dentist Pitampura",
    type: "Dental Clinic Website",
    tagline: "Treatments, doctor profiles and appointment enquiries for a dental clinic",
    url: "https://dentistpitampura.com/",
    categories: ["Websites"],
    overview:
      "A WordPress website for a dental clinic. It covers treatments, introduces the dentists, and lets visitors enquire about appointments.",
    features: [
      "Dental treatment and service pages",
      "Doctor profiles",
      "Appointment enquiry form",
      "Patient testimonials",
      "Dental health articles",
      "Clinic contact and location details",
    ],
    tech: ["WordPress"],
    contribution:
      "Built the website in WordPress, including the clinic services, doctor information and patient-facing content.",
    colors: ["#38bdf8", "#14b8a6"],
    icon: "Smile",
  },
  {
    id: "electricmarshmallow",
    name: "Electric Marshmallow",
    type: "Film Studio Website",
    tagline: "A portfolio website for an independent film production studio",
    url: "https://electricmarshmallow.com/",
    categories: ["Websites"],
    overview:
      "Electric Marshmallow Productions is an independent film studio. Its website presents the studio's projects, company story, mission and values.",
    features: [
      "Film and production portfolio",
      "Company profile and founder information",
      "Mission, values and inclusivity pages",
      "News, press and production announcements",
      "Contact and enquiries",
    ],
    tech: [],
    colors: ["#ec4899", "#8b5cf6"],
    icon: "Clapperboard",
  },
];

export const categories: ("All" | Category)[] = ["All", "Web Apps", "SaaS", "Ecommerce", "Websites", "Mobile", "AI"];

export const process = [
  { step: "Understand", desc: "Requirements, users, goals" },
  { step: "Design", desc: "Flows and interfaces" },
  { step: "Build", desc: "Frontend, backend and data" },
  { step: "Integrate", desc: "APIs, payments, email" },
  { step: "Ship", desc: "Deploy, test, hand over" },
  { step: "Improve", desc: "Maintain and add features" },
];

export const allTech = [
  "Next.js", "React", "TypeScript", "Node.js", "NestJS", "PHP", "PostgreSQL", "Drizzle ORM",
  "React Native", "Expo", "Tailwind CSS", "WordPress", "Three.js", "Framer Motion", "REST APIs", "Git",
];
