import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
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
      position="bottom-center"
      visibleToasts={1}
      className="toaster group"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-0 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          success:
            "group-[.toaster]:!bg-green-600 group-[.toaster]:!text-white group-[.toaster]:!border-0",
          error:
            "group-[.toaster]:!bg-red-600 group-[.toaster]:!text-white group-[.toaster]:!border-0",
          description: "group-[.toast]:text-inherit group-[.toast]:opacity-80",
          actionButton: "group-[.toast]:bg-white/20 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-white/20 group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
