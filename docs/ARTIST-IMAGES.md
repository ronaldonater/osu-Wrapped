# Artist pictures


Artist pictures use TheAudioDB v1 shared free key 123; no additional environment variables are required. The /artist-image endpoint validates exact artist names and approved artwork URLs, limits downloads to 512 KiB, coalesces identical in-flight requests, and caches up to 64 results in each warm function instance (24 hours for pictures, 1 hour for missing results). Successful images also use browser/CDN cache headers. A 25-lookups-per-minute guard applies per function instance, not globally across Netlify; upstream limits can still cause initials to display during traffic spikes. Missing or ambiguous artists use initials. Artwork attribution appears in the artist section and exported card.
