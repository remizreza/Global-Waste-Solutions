import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type InfoPreviewDialogProps = {
  title: string;
  subtitle?: string;
  points?: string[];
  ctaHref?: string;
  ctaLabel?: string;
  triggerLabel?: string;
};

export default function InfoPreviewDialog({
  title,
  subtitle,
  points = [],
  ctaHref,
  ctaLabel = "Go to page",
  triggerLabel = "Preview",
}: InfoPreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="btn-premium-outline !px-4 !py-2 !text-xs !font-tech"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-white/10 bg-[#07101f]/95 text-white backdrop-blur-xl">
        <DialogHeader>
          <p className="section-label text-xs">Preview Layer</p>
          <DialogTitle className="text-2xl font-display">{title}</DialogTitle>
          {subtitle ? (
            <DialogDescription className="text-gray-300">
              {subtitle}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {points.length > 0 ? (
          <ul className="section-shell mt-2 space-y-2 rounded-[1.25rem] p-4 text-sm text-gray-300">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="text-primary">▹</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {ctaHref ? (
          <div className="mt-4">
            <Link href={ctaHref} className="inline-flex">
              <Button className="btn-premium">
                {ctaLabel}
              </Button>
            </Link>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
