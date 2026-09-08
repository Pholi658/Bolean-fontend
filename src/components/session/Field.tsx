export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}
