"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { clsx } from "clsx";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { registerStep1Schema, passwordStrength, type RegisterStep1Values } from "@/lib/validation/auth";
import { useRegisterAccountMutation } from "@/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/lib/errors";

const PhonePrefix = () => (
  <span className="px-3.5 py-3 text-muted-foreground font-mono text-[13px] border-r border-border bg-muted flex-shrink-0">
    +266
  </span>
);

export function RegisterForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const router = useRouter();
  const registerAccountMutation = useRegisterAccountMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterStep1Values>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: { same_as_phone: false },
  });

  const password = watch("password") ?? "";
  const sameAsPhone = watch("same_as_phone");
  const phone = watch("phone_number") ?? "";
  const strength = passwordStrength(password);

  const onSubmit = async (values: RegisterStep1Values) => {
    setFormError(null);
    try {
      await registerAccountMutation.mutateAsync({
        full_name: values.full_name,
        phone_number: values.phone_number,
        whatsapp_number: values.same_as_phone ? values.phone_number : values.whatsapp_number,
        email: values.email,
        password: values.password,
      });
      // Step 2 (biometrics) now lives inside the dashboard shell rather
      // than a separate route — the guard there renders it in place of
      // the normal home content until the profile is verified.
      router.push("/");
    } catch (error) {
      setFormError(getFriendlyErrorMessage(error));
    }
  };

  const busy = isSubmitting || registerAccountMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors -ml-1 px-1"
        >
          <ArrowLeft size={12} /> Back
        </button>
        <p className="text-[10.5px] font-medium tracking-widest text-muted-foreground uppercase">
          Step 1 of 2
        </p>
      </div>
      <div className="flex gap-2 mb-1.5">
        <div className="h-[2.5px] flex-1 bg-primary rounded-full" />
        <div className="h-[2.5px] flex-1 bg-border rounded-full" />
      </div>

      <h1 className="font-display font-semibold text-xl text-foreground mb-0.5">Create your account</h1>
      <p className="mb-2 text-[13px] text-muted-foreground leading-relaxed">
        Verified identity, real reputation. Takes about two minutes.
      </p>

      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Full Name"
          autoComplete="name"
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <TextField
          label="Phone Number"
          type="tel"
          placeholder="5800 0000"
          prefix={<PhonePrefix />}
          className="font-mono"
          error={errors.phone_number?.message}
          {...register("phone_number")}
        />

        <div className="flex flex-col gap-1">
          <TextField
            label="WhatsApp Number"
            type="tel"
            placeholder="5800 0000"
            prefix={<PhonePrefix />}
            className="font-mono"
            disabled={sameAsPhone}
            error={errors.whatsapp_number?.message}
            {...register("whatsapp_number")}
          />
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={sameAsPhone}
              onChange={(e) => {
                setValue("same_as_phone", e.target.checked);
                if (e.target.checked) setValue("whatsapp_number", phone);
              }}
            />
            <span
              className={clsx(
                "w-[15px] h-[15px] rounded flex items-center justify-center flex-shrink-0 border transition-colors",
                sameAsPhone ? "bg-primary border-primary" : "border-border",
              )}
            >
              {sameAsPhone && <Check size={10} strokeWidth={3} className="text-primary-foreground" />}
            </span>
            <span className="text-[12.5px] text-muted-foreground">Same as phone number</span>
          </label>
        </div>

        <TextField
          label="Email Address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-1.5">
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            error={errors.password?.message}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="px-3.5 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            {...register("password")}
          />
          {password.length > 0 && (
            <>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={clsx(
                      "h-[3px] flex-1 rounded-full",
                      i < strength.score ? "bg-success" : "bg-border",
                    )}
                  />
                ))}
              </div>
              <span className="text-[10.5px] font-medium tracking-wide text-success uppercase">
                {strength.label}
              </span>
            </>
          )}
        </div>

        <TextField
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          autoComplete="new-password"
          error={errors.confirm_password?.message}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="px-3.5 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          {...register("confirm_password")}
        />

        {formError && <p className="text-sm text-destructive text-center">{formError}</p>}

        <Button type="submit" loading={busy} disabled={busy} className="mt-0.5 w-full">
          Next
        </Button>
      </form>
    </div>
  );
}
