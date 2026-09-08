"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useLoginMutation, CURRENT_USER_QUERY_KEY } from "@/hooks/useAuth";
import { fetchCurrentUser } from "@/lib/api/auth";
import { getFriendlyErrorMessage } from "@/lib/errors";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await loginMutation.mutateAsync(values);
      // Warm the cache before navigating so the dashboard's guard has the
      // fresh profile immediately. Whether the account is biometrically
      // verified or not, it always goes to "/" now — the guard there
      // renders the verification step in place of the normal home content
      // when it isn't verified yet, instead of a separate route.
      await queryClient.fetchQuery({ queryKey: CURRENT_USER_QUERY_KEY, queryFn: fetchCurrentUser });
      router.push("/");
    } catch (error) {
      setFormError(getFriendlyErrorMessage(error));
    }
  };

  const busy = isSubmitting || loginMutation.isPending;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl text-foreground">Welcome back</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Log in to your account.</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email Address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
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

        <div className="flex justify-end -mt-1">
          <span className="text-[12.5px] text-muted-foreground cursor-pointer">Forgot password?</span>
        </div>

        {formError && <p className="text-sm text-destructive text-center">{formError}</p>}

        <Button type="submit" loading={busy} disabled={busy} className="mt-1.5 w-full">
          Log in
        </Button>
      </form>
    </div>
  );
}
