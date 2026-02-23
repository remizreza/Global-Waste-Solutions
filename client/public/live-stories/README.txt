LIVE STORIES UPLOAD GUIDE

1) Upload media files (images/videos) into:
   /live-stories/media/

2) Edit /live-stories/stories.json and add/update slide items:
   {
     "id": "story-unique-id",
     "title": "Story title",
     "description": "Short description",
     "image": "/live-stories/media/your-file.jpg",
     "mediaType": "image"
   }

   For video:
   "mediaType": "video"
   "image": "/live-stories/media/your-video.mp4"

3) Save file. Website checks this JSON automatically every 60 seconds.

Notes:
- Keep file names web-safe (letters, numbers, dashes).
- Recommended image size: 1600x900 or larger.
- Recommended video: MP4 (H.264), under 25MB for smoother loading.
