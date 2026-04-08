import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { contactDetails } from "@/lib/siteContent";

type QuickEnquiryDialogProps = {
  productName: string;
  triggerLabel?: string;
};

export default function QuickEnquiryDialog({
  productName,
  triggerLabel = "Quick Enquiry",
}: QuickEnquiryDialogProps) {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState("");
  const [destination, setDestination] = useState("");
  const [application, setApplication] = useState("");

  const inquiryBody = useMemo(() => {
    return [
      `Product: ${productName}`,
      `Volume required: ${volume || "TBD"}`,
      `Destination: ${destination || "TBD"}`,
      `Application: ${application || "TBD"}`,
      "",
      "Please advise availability, pricing, and next steps.",
    ].join("\n");
  }, [productName, volume, destination, application]);

  const mailHref = `mailto:${contactDetails.email}?subject=${encodeURIComponent(
    `REDOXY Quick Enquiry: ${productName}`,
  )}&body=${encodeURIComponent(inquiryBody)}`;

  return (
    <>
      <button
        type="button"
        className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl border-white/10 bg-card/95 text-white backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-white">
              Quick Enquiry: {productName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              className="w-full px-4 py-3 bg-background/60 border border-white/10 rounded-sm text-white"
              placeholder="Volume required"
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
            />
            <input
              className="w-full px-4 py-3 bg-background/60 border border-white/10 rounded-sm text-white"
              placeholder="Destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
            <input
              className="w-full px-4 py-3 bg-background/60 border border-white/10 rounded-sm text-white"
              placeholder="Application"
              value={application}
              onChange={(event) => setApplication(event.target.value)}
            />
            <a href={mailHref} className="btn-premium w-full text-center">
              Send Enquiry
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
