import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Read theme from localStorage to match ThemeSwitcher
  const getTheme = (): ToasterProps["theme"] => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem('theme') as string | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return 'system';
  };

  return (
    <Sonner
      duration={3000}
      theme={getTheme()}
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
};

export { Toaster, toast };
