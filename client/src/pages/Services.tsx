import { Link } from "wouter";
import { motion } from "framer-motion";
import SiteLayout from "@/components/SiteLayout";
import InfoPreviewDialog from "@/components/InfoPreviewDialog";
import { contactDetails, pageLinks, serviceDivisions } from "@/lib/siteContent";
import { useMemo, useState } from "react";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ServiceId = (typeof serviceDivisions)[number]["id"];

type QuestionFlow = {
  q1: {
    prompt: string;
    options: string[];
  };
  q2: {
    prompt: string;
    options: string[];
  };
};

const questionFlowByService: Record<ServiceId, QuestionFlow> = {
  environmental: {
    q1: {
      prompt: "What stream needs immediate treatment?",
      options: ["Wastewater", "Sludge / tank bottom", "Mixed hazardous waste"],
    },
    q2: {
      prompt: "When do you want mobilization?",
      options: ["Within 72 hours", "Within 2 weeks", "Planned shutdown window"],
    },
  },
  industrial: {
    q1: {
      prompt: "Which asset needs service?",
      options: ["Heat exchanger / boiler", "Storage tanks", "Process piping"],
    },
    q2: {
      prompt: "What is the service objective?",
      options: ["Cleaning & restoration", "Inspection readiness", "Turnaround acceleration"],
    },
  },
  trading: {
    q1: {
      prompt: "What do you need to procure?",
      options: ["Fuel / blend stock", "Chemical feedstock", "Bitumen / residue"],
    },
    q2: {
      prompt: "Preferred deal structure?",
      options: ["Spot cargo", "Monthly contract", "Quarterly allocation"],
    },
  },
};

type Answers = {
  q1?: string;
  q2?: string;
};

export default function Services() {
  const [activeServiceId, setActiveServiceId] = useState<ServiceId | null>(null);
  const [answersByService, setAnswersByService] = useState<
    Record<ServiceId, Answers>
  >({
    environmental: {},
    industrial: {},
    trading: {},
  });

  const activeService = useMemo(
    () => serviceDivisions.find((service) => service.id === activeServiceId),
    [activeServiceId],
  );

  const activeAnswers =
    activeServiceId !== null
      ? answersByService[activeServiceId]
      : ({} as Answers);

  const step =
    !activeAnswers.q1 ? 1 : !activeAnswers.q2 ? 2 : 3;

  const setAnswer = (questionKey: "q1" | "q2", value: string) => {
    if (!activeServiceId) return;
    setAnswersByService((prev) => ({
      ...prev,
      [activeServiceId]: {
        ...prev[activeServiceId],
        [questionKey]: value,
      },
    }));
  };

  const buildInquiryText = () => {
    if (!activeService) return "";
    const lines = [
      `Service inquiry: ${activeService.title}`,
      `Q1: ${activeAnswers.q1 ?? "Not selected"}`,
      `Q2: ${activeAnswers.q2 ?? "Not selected"}`,
      "Please share next steps and proposal details.",
    ];
    return lines.join("\n");
  };

  const inquiryText = buildInquiryText();
  const whatsappHref =
    inquiryText.length > 0
      ? `${contactDetails.whatsappUrl}?text=${encodeURIComponent(inquiryText)}`
      : contactDetails.whatsappUrl;
  const mailHref = `mailto:${contactDetails.email}?subject=${encodeURIComponent(
    `Inquiry: ${activeService?.title ?? "REDOXY Service"}`,
  )}&body=${encodeURIComponent(inquiryText)}`;

  const openQuickScope = (serviceId: ServiceId) => {
    setAnswersByService((prev) => ({
      ...prev,
      [serviceId]: {},
    }));
    setActiveServiceId(serviceId);
  };

  const closeQuickScope = () => {
    setActiveServiceId(null);
  };

  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="bg-video-smooth absolute inset-0 w-full h-full object-cover opacity-48"
            src="/assets/Services.mp4"
            preload="auto"
            muted
            loop
            playsInline
            autoPlay
            poster="/assets/hero-fallback.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/35 to-secondary/85" />
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-14">
            <p className="inline-flex px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-tech tracking-widest mb-5">
              INTEGRATED SOLUTIONS
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-5">
              Services by Entity Capability
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Structured by operating strengths: KSA execution teams for
              technical services and UAE for agile trading/logistics.
            </p>
            <p className="inline-flex mt-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-tech tracking-[0.18em] uppercase">
              REDOXY MTU 001 In Service Focus
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-7">
            {serviceDivisions.map((division) => (
              <motion.div
                key={division.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-card/60 border border-white/10 rounded-xl overflow-hidden flex flex-col backdrop-blur-sm"
              >
                <div className="aspect-video w-full bg-black/20">
                  <img
                    src={division.bgImage}
                    alt={division.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-primary text-xs font-tech uppercase tracking-wider mb-2">
                    {division.entity}
                  </p>
                  <h2 className="text-2xl font-display text-white mb-3">
                    {division.title}
                  </h2>
                  {division.id === "environmental" ? (
                    <p className="text-xs text-orange-200 font-tech uppercase tracking-[0.16em] mb-3">
                      Flagship: REDOXY MTU 001
                    </p>
                  ) : null}
                  <p className="text-gray-300 text-sm mb-4">
                    {division.summary}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-6 flex-1">
                    {division.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-primary">▹</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-3">
                    <InfoPreviewDialog
                      title={division.title}
                      subtitle="Wider brochure preview"
                      points={division.details}
                      ctaHref={division.route}
                      ctaLabel="Open linked page"
                    />
                    <Link href={division.route}>
                      <a className="btn-premium-outline !px-3 !py-2 !text-xs !font-tech">
                        Linked section
                      </a>
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => openQuickScope(division.id)}
                    className="btn-premium mt-4 !px-3 !py-2 !text-xs"
                  >
                    Start Quick Scope
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <Dialog open={activeServiceId !== null} onOpenChange={(open) => !open && closeQuickScope()}>
            {activeService ? (
              <DialogContent className="max-w-4xl border-white/10 bg-card/95 text-white backdrop-blur-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl text-white">
                    Smart Inquiry: {activeService.title}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Answer one or two quick questions, then continue directly on
                    WhatsApp or Email.
                  </DialogDescription>
                </DialogHeader>

                <div className="border border-white/10 rounded-xl p-5 bg-background/40">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary font-tech mb-2">
                    Brief Technology Context
                  </p>
                  <p className="text-sm text-gray-200">{activeService.details[0]}</p>
                </div>

                {step <= 2 ? (
                  <div className="space-y-5">
                    <p className="text-white font-medium">
                      {step === 1
                        ? questionFlowByService[activeService.id].q1.prompt
                        : questionFlowByService[activeService.id].q2.prompt}
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      {(step === 1
                        ? questionFlowByService[activeService.id].q1.options
                        : questionFlowByService[activeService.id].q2.options
                      ).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setAnswer(step === 1 ? "q1" : "q2", option)
                          }
                          className="link-premium text-left"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      Fast route: complete up to two answers and continue with
                      direct team contact.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p className="inline-flex items-center gap-2 text-sm text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Scope captured. Continue for detailed engagement.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-whatsapp-premium !py-3 justify-center"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Continue on WhatsApp
                      </a>
                      <a href={mailHref} className="btn-premium !py-3 justify-center">
                        <Mail className="h-4 w-4" />
                        Continue by Email
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!activeServiceId) return;
                          setAnswersByService((prev) => ({
                            ...prev,
                            [activeServiceId]: {},
                          }));
                        }}
                        className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech"
                      >
                        Start Again
                      </button>
                      <button
                        type="button"
                        onClick={closeQuickScope}
                        className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </DialogContent>
            ) : null}
          </Dialog>

          <div className="mt-12 text-center">
            <Link href={pageLinks.contact}>
              <a className="btn-premium">
                Request Project Consultation
              </a>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
