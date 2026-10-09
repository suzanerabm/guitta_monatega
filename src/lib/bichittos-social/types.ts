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

export type PlatformState = {
  status: "pending" | "publishing" | "published" | "needs_review";
  externalId: string | null;
  error: string | null;
};

export type PublicationState = {
  occurrence: string;
  lockOwner: string;
  lockUntil: string;
  updatedAt: string;
  instagram: PlatformState;
  facebook: PlatformState;
};

