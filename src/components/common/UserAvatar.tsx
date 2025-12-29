import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    user?: {
        photoURL?: string | null;
        email?: string | null;
    };
    userProfile?: {
        firstName?: string;
        lastName?: string;
    } | null;
    className?: string;
    fallbackClassName?: string;
    variant?: "header" | "profile" | "default";
}

export function UserAvatar({
    user,
    userProfile,
    className,
    fallbackClassName,
    variant = "default"
}: UserAvatarProps) {
    const initials = userProfile
        ? `${userProfile.firstName?.[0] || ""}${userProfile.lastName?.[0] || ""}`
        : user?.email?.[0]?.toUpperCase() || "U";

    const sizeClasses = className || "h-9 w-9";

    // Use a direct div for initials to avoid Radix Avatar flex conflicts that cause "semi-circles"
    if (!user?.photoURL) {
        return (
            <div
                className={cn(
                    "rounded-full bg-primary text-white flex items-center justify-center uppercase font-bold overflow-hidden shrink-0",
                    sizeClasses,
                    variant === "header" ? "text-sm" : variant === "profile" ? "text-2xl" : "text-base",
                    fallbackClassName
                )}
            >
                {initials}
            </div>
        );
    }

    return (
        <Avatar className={cn(sizeClasses, "shrink-0")}>
            <AvatarImage src={user.photoURL} className="object-cover" />
            <AvatarFallback className={cn("bg-primary text-white", fallbackClassName)}>
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
