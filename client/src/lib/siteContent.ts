export type StorySlideContent = {
  id: string;
  title: string;
  description: string;
  image: string;
  mediaType?: "image" | "video" | "pdf";
  pdfPages?: number;
};

export const pageLinks = {
  home: "/",
  about: "/about",
  services: "/services",
  technology: "/technology",
  traction: "/traction",
  contact: "/contact",
  products: "/products",
};

export const homeStats = [
  {
    label: "Operating Since",
    value: "2020",
    description: "KSA technical and environmental operations",
  },
  {
    label: "Dual Entity",
    value: "KSA + UAE",
    description: "Industrial execution + agile trading and logistics",
  },
  {
    label: "2025 Revenue Achievement",
    value: "46%",
    description: "Revenue achieved through high-performance delivery in 2025",
  },
  {
    label: "Sustainability Goal",
    value: "Net-Zero 2050",
    description: "ISO 14001-aligned environmental roadmap",
  },
];

export const serviceDivisions = [
  {
    id: "environmental",
    title: "Environmental & Waste Management",
    entity: "KSA Team",
    summary:
      "Full-cycle environmental solutions from hazardous waste handling to water treatment.",
    highlights: [
      "REDOXY MTU 001 now in active modular deployment pipeline",
      "Full-cycle green waste solutions",
      "Hazardous waste handling and sludge removal",
      "Tank and industrial cleaning",
      "ISO 14001:2015-aligned operations",
    ],
    details: [
      "REDOXY MTU 001 combines compact treatment engineering with field-ready mobilization.",
      "Advanced treatment processes include Reverse Osmosis, Electro Oxidation, and Vacuum Evaporation.",
      "Designed for industrial plants requiring reliable compliance and recovery outcomes.",
      "Integrated with onsite logistics and emergency support to minimize downtime.",
    ],
    bgImage: "/water-bg.jpg",
    route: "/technology",
  },
  {
    id: "industrial",
    title: "Specialized Industrial Services",
    entity: "KSA Team",
    summary:
      "Execution-focused mechanical, cleaning, and surface preparation services for industrial assets.",
    highlights: [
      "Chemical cleaning for boilers, reactors, and exchangers",
      "API-standard blasting and painting",
      "Hydro-jetting and precision onsite machining",
      "Support references include Sadara, SATORP, Farabi, and NOMAC",
    ],
    details: [
      "Services are structured for petrochemical and heavy-industry operating environments.",
      "Combines technical crews, maintenance tooling, and QA discipline.",
      "Built to improve reliability, safety, and turnaround speed.",
    ],
    bgImage: "/industrial-bg.jpg",
    route: "/traction",
  },
  {
    id: "trading",
    title: "Industrial Trading & Logistics",
    entity: "UAE Team",
    summary:
      "Agile regional trade hub connecting industrial demand with secure supply and market timing.",
    highlights: [
      "Fuel oil, diesel blend stock, and bitumen residue",
      "MEG/DEG, caustic soda, and oilfield chemicals",
      "Fixed-pricing advantage for strategic products",
      "Market downcycle procurement strategy",
    ],
    details: [
      "REDOXY F.Z.C. provides responsive trade execution across GCC-linked corridors.",
      "Commercial model focuses on margin discipline and reliable fulfillment.",
      "Roadmap includes distribution expansion to support Africa and Asia growth.",
    ],
    bgImage: "/logistics-bg.jpg",
    route: "/products",
  },
];

export const technologyModules = [
  {
    id: "ro",
    title: "Reverse Osmosis (RO)",
    summary:
      "Membrane-based separation for wastewater purification and resource recovery.",
    details: [
      "Applied where dissolved contaminants require high-efficiency separation.",
      "Supports broader environmental service lines with repeatable quality output.",
    ],
  },
  {
    id: "chem-ox",
    title: "Chemical Oxidation",
    summary:
      "Targeted oxidation treatment for breakdown of hazardous compounds.",
    details: [
      "Used in difficult streams where conventional treatment is insufficient.",
      "Integrated with pretreatment and downstream polishing processes.",
    ],
  },
  {
    id: "electro-ox",
    title: "Electro Oxidation",
    summary:
      "Electrochemical treatment pathway for persistent pollutant reduction.",
    details: [
      "Delivers high-effect treatment capability in compact deployment footprints.",
      "Pairs with onsite modular units for controlled operation.",
    ],
  },
  {
    id: "precision-industrial",
    title: "Precision Industrial Methods",
    summary:
      "Hydro-jetting and onsite machining for operational efficiency and uptime.",
    details: [
      "Supports turnaround reduction and maintenance quality.",
      "Extends lifecycle and reliability of critical equipment.",
    ],
  },
  {
    id: "digital-rd",
    title: "Digital Transformation",
    summary:
      "Operational intelligence roadmap combining ERP and AI-enabled planning.",
    details: [
      "Short-term: SAP S/4HANA and Palantir Foundry for logistics and controls.",
      "Medium-term: AI forecasting and automated fleet management.",
    ],
  },
];

export const rdAchievements = [
  "REDOXY MTU 001 modular architecture engineered for rapid industrial deployment.",
  "Integrated process stack combining RO, chemical oxidation, and electro-oxidation.",
  "Field execution framework aligned with precision industrial maintenance workflows.",
  "Digital roadmap: ERP + AI planning foundation for predictive operating control.",
];

export const tractionItems = [
  {
    title: "Financial Health",
    metric: "46% Revenue Achievement",
    subtitle: "Performance level achieved in 2025 with profitability momentum",
    details: [
      "Reflects disciplined project execution and controlled operating model.",
      "2030 target set to reach 80% profit with expanded program scale.",
    ],
  },
  {
    title: "UAE Revenue Target",
    metric: "AED 420,000/mo",
    subtitle: "Projected monthly revenue run-rate",
    details: [
      "Built on trading portfolio velocity and logistics optimization.",
      "Supports expansion funding and market development.",
    ],
  },
  {
    title: "2029 Growth Objective",
    metric: "AED 500M+",
    subtitle: "Revenue ambition by 2029",
    details: [
      "Short-term: refinery partnerships and distribution hubs.",
      "Mid-term: strategic expansion across Africa and Asia corridors.",
    ],
  },
  {
    title: "2035 Energy Transition",
    metric: "50% New Energy",
    subtitle: "Target revenue share from future ventures",
    details: [
      "Focus domains: Green Hydrogen, SAF, and CCS pathways.",
      "Aligned with long-term sustainability and market positioning.",
    ],
  },
  {
    title: "REDOXY MTU 001",
    metric: "In Service Focus",
    subtitle: "Flagship modular unit prioritized across current opportunities",
    details: [
      "Highlighted as a core transformation asset for industrial waste treatment programs.",
      "Supports faster execution cycles with scalable modular architecture.",
    ],
  },
];

export const tractionContracts = [
  {
    title: "KSA Contract: Manarsdha",
    subtitle: "Modular waste treatment transformation program",
    details: [
      "Scope includes staged deployment planning for modular treatment operations in KSA.",
      "Program focus: operational reliability, treatment efficiency, and compliance-ready delivery.",
      "Execution emphasis on REDOXY MTU 001 as a high-priority modular asset line.",
    ],
  },
];

export const technologyStorySlides: StorySlideContent[] = [
  {
    id: "advanced-water-infrastructure",
    title: "Advanced Water Infrastructure Outlook",
    description:
      "Regional desalination and industrial reuse investments are accelerating resilient water systems in GCC markets.",
    image: "https://images.pexels.com/photos/1076758/pexels-photo-1076758.jpeg",
    mediaType: "image",
  },
  {
    id: "modular-treatment-design",
    title: "Modular Treatment Design Standards",
    description:
      "Compact process skids are being prioritized for faster commissioning, cleaner maintenance windows, and lower lifecycle risk.",
    image: "https://images.pexels.com/photos/257700/pexels-photo-257700.jpeg",
    mediaType: "image",
  },
  {
    id: "digital-industrial-control",
    title: "Industrial Digital Control Rooms",
    description:
      "Operational teams are integrating process telemetry and remote diagnostics to improve uptime and response planning.",
    image: "https://images.pexels.com/photos/3912360/pexels-photo-3912360.jpeg",
    mediaType: "image",
  },
];

export const tractionStorySlides: StorySlideContent[] = [
  {
    id: "energy-logistics-corridor",
    title: "Energy Logistics Corridor Development",
    description:
      "Port-connected storage and blending nodes continue to improve cross-border reliability for industrial offtake programs.",
    image: "https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg",
    mediaType: "image",
  },
  {
    id: "petrochemical-demand-cycle",
    title: "Petrochemical Demand & Margin Signals",
    description:
      "Feedstock planning now balances inventory discipline with flexible procurement windows through quarterly market cycles.",
    image: "https://images.pexels.com/photos/221047/pexels-photo-221047.jpeg",
    mediaType: "image",
  },
  {
    id: "future-energy-transition",
    title: "Future Energy Transition Readiness",
    description:
      "Hydrogen, SAF, and carbon-management pathways are moving from roadmap planning toward pilot-stage execution.",
    image: "https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg",
    mediaType: "image",
  },
];

export const storySlides = technologyStorySlides;

export const aboutValues = [
  {
    title: "Operational Excellence",
    description:
      "Delivering consistent, professional, and high-quality services in high-stakes industrial contexts.",
  },
  {
    title: "ESG Responsibility",
    description:
      "Commitment to Net-Zero by 2050 with ISO 14001-aligned environmental operating standards.",
  },
  {
    title: "Innovation",
    description:
      "Continuous adoption of advanced industrial methods and digital systems.",
  },
];

export const investmentCallout = {
  headline: "2025-2029 Strategic Growth & Investment Opportunity",
  tagline: "Propelling Saudi Vision 2030 Through Circular Energy Solutions",
  summary:
    "REDOXY is scaling modular industrial infrastructure with an execution-led GCC expansion strategy anchored by MTU deployment programs and cross-border industrial trade.",
};

export const entityStructure = [
  {
    entity: "REDOXY-ITCC (KSA)",
    legal: "Innovative Technical Contracting Company LLC",
    established: "2020",
    focus: "Technical, environmental, and industrial field execution",
  },
  {
    entity: "REDOXY F.Z.C. (UAE)",
    legal: "Free Zone Company (F.Z.C. - Ltd Liability)",
    established: "2025",
    focus: "Agile industrial trading, supply, and logistics",
  },
];

export const contactDetails = {
  strategyOffice: "Corporate Strategy & Finance Division, UAE",
  phoneUAE: "+971 50 420 0717",
  phoneKSA: "+966 53 378 6083",
  website: "www.redoxyksa.com",
  email: "info@redoxyksa.com",
  whatsappUrl: "https://wa.me/971504200717",
  mapsUAE:
    "https://www.google.com/maps/search/?api=1&query=Sharjah+Airport+International+Free+Zone",
  mapsKSA:
    "https://www.google.com/maps/search/?api=1&query=Riyadh+Saudi+Arabia",
};

export const ownershipProfiles = [
  {
    name: "Remiz Ali Rasheed",
    role: "CSMO – REDOXY-ITCC (KSA) | Director – REDOXY FZC (UAE)",
    education:
      "Bachelor's in Mechatronics Engineering, Anna University, Chennai",
    experience: "10+ years in petrochemical industries and trading",
    highlights: [
      "Holds 40% equity in REDOXY-ITCC and leads strategic expansion, procurement, and R&D.",
      "Drives industrial waste management and petrochemical by-product blending initiatives.",
      "Leads stakeholder engagement across KSA, UAE, and India markets.",
    ],
    email: "remiz@redoxyksa.com",
  },
  {
    name: "Ajmal Palathingal",
    role: "CEO – REDOXY-ITCC (KSA) | Managing Partner – REDOXY FZC (UAE)",
    education:
      "Bachelor's Degree in Petroleum Engineering, Anna University, Chennai",
    experience: "12+ years in logistics, industrial materials trading, and finance",
    highlights: [
      "Oversees financial administration and daily operations across KSA and UAE entities.",
      "Leads vendor/client coordination, trade documentation, and compliance governance.",
      "Supports partnership structuring and business continuity for GCC execution.",
    ],
    email: "ajmal@redoxyksa.com",
  },
];
