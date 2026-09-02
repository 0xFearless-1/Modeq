import {
  Megaphone,
  MessageSquareWarning,
  UserX,
  EyeOff,
  Flame,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

export type CategoryKey = "spam" | "hate_speech" | "harassment" | "nsfw" | "violence" | "none";

export const CATEGORY_META: Record<CategoryKey, { icon: LucideIcon; label: string }> = {
  spam: { icon: Megaphone, label: "Spam" },
  hate_speech: { icon: MessageSquareWarning, label: "Hate speech" },
  harassment: { icon: UserX, label: "Harassment" },
  nsfw: { icon: EyeOff, label: "NSFW" },
  violence: { icon: Flame, label: "Violence" },
  none: { icon: CheckCircle2, label: "Clean" },
};

export function categoryMeta(key: string) {
  return CATEGORY_META[key as CategoryKey] ?? CATEGORY_META.none;
}
