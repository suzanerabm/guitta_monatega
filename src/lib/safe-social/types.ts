export type PublicationItem = {
  occurrence: string;
  postId: string;
  scheduledAt: string;
  world: string;
  type: string;
  media:
    | { kind: "image"; image: { url: string } }
    | { kind: "carousel"; images: Array<{ url: string }> }
    | { kind: "reel"; video: { url: string }; cover: { url: string } };
  instagram: { caption: string };
  facebook: { message: string };
};

export type Platform = "instagram" | "facebook";

export type PlatformStatus =
  | "pending"
  | "building_carousel"
  | "container_created"
  | "waiting_for_media"
  | "media_ready"
  | "publish_requested"
  | "published"
  | "needs_review"
  | "brand_paused";

export type MetaOperation =
  | "create_instagram_container"
  | "create_instagram_carousel_child"
  | "check_instagram_carousel_child"
  | "create_instagram_carousel_container"
  | "check_instagram_container"
  | "publish_instagram_media"
  | "confirm_instagram_media"
  | "publish_facebook_image"
  | "create_facebook_carousel_child"
  | "publish_facebook_carousel"
  | "confirm_facebook_media";

export type MetaCallAuthorization = {
  occurrence: string;
  platform: Platform;
  operation: MetaOperation;
  carouselIndex: number | null;
  correlationId: string;
};

export type CarouselChildState = {
  status: "pending" | "waiting_for_media" | "media_ready" | "needs_review";
  containerId: string | null;
  nextActionAt: string | null;
  statusChecks: number;
  error: string | null;
};

export type PlatformState = {
  status: PlatformStatus;
  externalId: string | null;
  containerId: string | null;
  nextActionAt: string | null;
  statusChecks: number;
  inFlight: {
    operation: MetaOperation;
    carouselIndex: number | null;
    correlationId: string;
    startedAt: string;
  } | null;
  carousel: { children: CarouselChildState[] } | null;
  error: string | null;
};

export type PublicationState = {
  schemaVersion: 3;
  occurrence: string;
  lockOwner: string;
  lockUntil: string;
  updatedAt: string;
  metaCalls: number;
  instagram: PlatformState;
  facebook: PlatformState;
};
