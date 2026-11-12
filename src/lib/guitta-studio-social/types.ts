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
  | "container_created"
  | "waiting_for_media"
  | "media_ready"
  | "publish_requested"
  | "published"
  | "needs_review"
  | "brand_paused";

export type MetaOperation =
  | "create_instagram_container"
  | "check_instagram_container"
  | "publish_instagram_media"
  | "confirm_instagram_media"
  | "publish_facebook_image"
  | "confirm_facebook_media";

export type PlatformState = {
  status: PlatformStatus;
  externalId: string | null;
  containerId: string | null;
  nextActionAt: string | null;
  statusChecks: number;
  inFlight: {
    operation: MetaOperation;
    correlationId: string;
    startedAt: string;
  } | null;
  error: string | null;
};

export type PublicationState = {
  schemaVersion: 2;
  occurrence: string;
  lockOwner: string;
  lockUntil: string;
  updatedAt: string;
  instagram: PlatformState;
  facebook: PlatformState;
};
