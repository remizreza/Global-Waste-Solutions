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
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  adminLogin: "/admin/login",
  adminDashboard: "/admin/dashboard",
};

export const homeStats = [
  {
    label: "Operating Base",
    value: "2020",
    description: "KSA-led technical and environmental execution platform",
  },
  {
    label: "Group Structure",
    value: "KSA + UAE",
    description: "Integrated delivery company with regional trading and logistics capability",
  },
  {
    label: "2025 Performance",
    value: "46%",
    description: "Revenue achievement secured through disciplined project delivery in 2025",
  },
  {
    label: "Sustainability Direction",
    value: "Net-Zero 2050",
    description: "ISO 14001-aligned environmental roadmap with long-range decarbonization targets",
  },
];

export const serviceDivisions = [
  {
    id: "environmental",
    title: "Environmental & Waste Management",
    entity: "KSA Team",
    summary:
      "Industrial environmental services covering hazardous waste handling, remediation, and water treatment.",
    highlights: [
      "REDOXY MTU 001 positioned for active modular deployment programs",
      "Hazardous waste handling, sludge removal, and onsite remediation",
      "Industrial tank cleaning and wastewater treatment support",
      "Compliance-led delivery aligned with ISO 14001:2015",
      "Rapid field mobilization for regulated operating environments",
    ],
    details: [
      "REDOXY MTU 001 combines modular process engineering with field-ready mobilization.",
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
      "Shutdown-critical mechanical, cleaning, and surface preparation services for industrial assets.",
    highlights: [
      "Chemical cleaning for boilers, reactors, and exchangers",
      "API-standard blasting and painting",
      "Hydro-jetting and precision onsite machining",
      "Support references include Sadara, SATORP, Farabi, and NOMAC",
    ],
    details: [
      "Structured for petrochemical, utility, and heavy-industry operating environments.",
      "Combines specialized crews, maintenance tooling, and QA discipline.",
      "Designed to improve reliability, safety, and turnaround performance.",
    ],
    bgImage: "/industrial-bg.jpg",
    route: "/traction",
  },
  {
    id: "trading",
    title: "Industrial Trading & Logistics",
    entity: "UAE Team",
    summary:
      "Regional trading desk connecting industrial demand with supply security, timing, and logistics control.",
    highlights: [
      "Fuel oil, diesel blend stock, and bitumen residue",
      "MEG/DEG, caustic soda, and oilfield chemicals",
      "Structured pricing advantage for strategic products",
      "Downcycle procurement and margin-protection strategy",
    ],
    details: [
      "REDOXY F.Z.C. provides responsive trade execution across GCC-linked corridors.",
      "Commercial model centers on margin discipline and reliable fulfilment.",
      "Roadmap includes selective distribution expansion across Africa and Asia corridors.",
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
      "Operational intelligence roadmap combining ERP architecture and AI-assisted planning.",
    details: [
      "Short-term: SAP S/4HANA and Palantir Foundry for logistics and controls.",
      "Medium-term: AI forecasting and automated fleet management.",
    ],
  },
];

export const rdAchievements = [
  "REDOXY MTU 001 modular architecture engineered for rapid industrial deployment.",
  "Integrated treatment stack combining RO, chemical oxidation, and electro-oxidation.",
  "Field delivery framework aligned with precision industrial maintenance workflows.",
  "ERP and AI planning roadmap designed for predictive operating control.",
];

export const tractionItems = [
  {
    title: "Delivery Performance",
    metric: "46% Revenue Achievement",
    subtitle: "2025 performance secured with improving profitability discipline",
    details: [
      "Reflects disciplined project execution and controlled operating model.",
      "2030 target set to reach 80% profit with expanded program scale.",
    ],
  },
  {
    title: "UAE Commercial Target",
    metric: "AED 420,000/mo",
    subtitle: "Projected monthly revenue run-rate",
    details: [
      "Built on trading portfolio velocity and logistics optimization.",
      "Supports expansion funding and market development.",
    ],
  },
  {
    title: "2029 Revenue Objective",
    metric: "AED 500M+",
    subtitle: "Revenue ambition by 2029",
    details: [
      "Short-term: refinery partnerships and distribution hubs.",
      "Mid-term: strategic expansion across Africa and Asia corridors.",
    ],
  },
  {
    title: "2035 Transition Mix",
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
    id: "technology-story-film",
    title: "Technology Story Film",
    description:
      "Autoplaying REDOXY technology film showing treatment systems, deployment atmosphere, and engineering positioning.",
    image: "/assets/Technology.mp4",
    mediaType: "video",
  },
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
    id: "traction-story-film",
    title: "REDOXY Investment Story Film",
    description:
      "Autoplaying REDOXY growth film covering modular infrastructure, industrial execution, and expansion narrative.",
    image: "/live-stories/media/Live.mp4",
    mediaType: "video",
  },
  {
    id: "redoxy-investment-deck-cover",
    title: "REDOXY Investment Deck",
    description:
      "Scaling modular industrial infrastructure across KSA and UAE with an execution-led GCC expansion model.",
    image: "/story-assets/REDOXY_Scaling_Modular_Industrial_Infrastructure (1).pdf.png",
    mediaType: "image",
  },
  {
    id: "redoxy-mtu-scale",
    title: "MTU 001 Modular Scale Path",
    description:
      "Flagship modular treatment deployment strategy positioned for staged commercial rollout and partner-backed scaling.",
    image: "/story-assets/mtu-scale-01.png",
    mediaType: "image",
  },
  {
    id: "redoxy-network-corridors",
    title: "Cross-Border Industrial Corridors",
    description:
      "Trading, logistics, and industrial service integration across GCC-linked demand corridors.",
    image: "/story-assets/network-connectivity.jpg",
    mediaType: "image",
  },
  {
    id: "redoxy-industrial-asset-engine",
    title: "Industrial Asset Engine",
    description:
      "Asset-backed service and treatment capabilities structured to support recurring industrial revenue lines.",
    image: "/story-assets/Redoxy_Industrial_Asset_Engine (1).pdf.png",
    mediaType: "image",
  },
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

export const servicesStorySlides: StorySlideContent[] = [
  {
    id: "services-story-film",
    title: "Services Story Film",
    description:
      "Autoplaying REDOXY services film showing field execution, industrial cleaning, and modular treatment positioning.",
    image: "/assets/Services.mp4",
    mediaType: "video",
  },
  ...tractionStorySlides.slice(1),
];

export const storySlides = technologyStorySlides;

export const aboutValues = [
  {
    title: "Execution Discipline",
    description:
      "Delivering reliable, high-quality performance in high-stakes industrial environments.",
  },
  {
    title: "Environmental Stewardship",
    description:
      "Advancing Net-Zero by 2050 through ISO 14001-aligned operating standards and practical sustainability controls.",
  },
  {
    title: "Applied Innovation",
    description:
      "Adopting treatment technology, modular systems, and digital tooling where they improve execution.",
  },
];

export const investmentCallout = {
  headline: "2025-2029 Industrial Growth & Capital Opportunity",
  tagline: "Supporting Saudi Vision 2030 through circular infrastructure and industrial services",
  summary:
    "REDOXY is scaling modular industrial infrastructure through an execution-led GCC growth strategy anchored by MTU deployment programs, environmental services, and cross-border industrial trade.",
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
