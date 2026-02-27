import { useEffect, useState } from "react";
import StorySlideshow from "@/components/StorySlideshow";

type LiveStory = {
  id: string;
  title: string;
  description: string;
  image: string;
  mediaType?: "image" | "video" | "pdf";
  pdfPages?: number;
};

type LiveStoriesFile = {
  title?: string;
  subtitle?: string;
  slides?: LiveStory[];
};

type LiveStoriesBoardProps = {
  fallbackTitle: string;
  fallbackSubtitle?: string;
  fallbackSlides: LiveStory[];
};

export default function LiveStoriesBoard({
  fallbackTitle,
  fallbackSubtitle,
  fallbackSlides,
}: LiveStoriesBoardProps) {
  const [title, setTitle] = useState(fallbackTitle);
  const [subtitle, setSubtitle] = useState(fallbackSubtitle);
  const [slides, setSlides] = useState<LiveStory[]>(fallbackSlides);

  useEffect(() => {
    let active = true;

    const loadStories = async () => {
      try {
        const response = await fetch("/live-stories/stories.json");
        if (!response.ok) return;
        const payload = (await response.json()) as LiveStoriesFile;
        if (!active) return;
        if (payload.title) setTitle(payload.title);
        if (payload.subtitle) setSubtitle(payload.subtitle);
        if (payload.slides && payload.slides.length > 0) {
          setSlides(payload.slides);
        }
      } catch {
        // keep fallback content when file not present/invalid
      }
    };

    loadStories();
    const intervalId = window.setInterval(loadStories, 60000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return <StorySlideshow title={title} subtitle={subtitle} slides={slides} />;
}
