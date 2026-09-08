import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh bg-background flex items-center justify-center px-6 py-3 relative overflow-hidden">
      <div
        className="absolute w-[520px] h-[520px] rounded-full bg-primary opacity-[0.05] pointer-events-none"
        style={{ filter: "blur(180px)", top: "-160px", left: "-100px" }}
      />
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>
      <div className="relative w-full flex items-center justify-center">{children}</div>
    </div>
  );
}
