import type { ComponentProps } from "react";
import { Toaster as Sonner, toast } from "sonner";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type ToasterProps = ComponentProps<typeof Sonner>;

function ToasterInner({ ...props }: ToasterProps) {
  const { preferences } = useUserPreferences();

  return (
    <Sonner
      theme={preferences.theme === "dark" ? "dark" : "light"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

const Toaster = (props: ToasterProps) => <ToasterInner {...props} />;

export { Toaster, toast };
