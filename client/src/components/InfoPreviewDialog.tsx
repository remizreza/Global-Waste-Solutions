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
      <DialogContent className="bg-card border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{title}</DialogTitle>
          {subtitle ? (
            <DialogDescription className="text-gray-300">
              {subtitle}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {points.length > 0 ? (
          <ul className="space-y-2 text-sm text-gray-300 mt-2">
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
            <Link href={ctaHref}>
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
