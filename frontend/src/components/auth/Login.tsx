import React, { useState } from "react";
import { Stethoscope, KeyRound, Mail, ArrowRight, UserRound, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Btn, Field, GlassCard, Pill, inputClass } from "../pulse/ui";

export function Login({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login, setDemoUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await login(email, password);
    } catch (err) {
      // Toast handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = (role: "PATIENT" | "DOCTOR" | "ADMIN", demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setDemoUser(role);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)] mx-auto mb-2">
            <Stethoscope className="size-7" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gradient">
            PulseCare Portal
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in to access your clinical dashboard, visits, and AI pre-visit triage
          </p>
        </div>

        {/* 1-Click Demo Login Shortcuts */}
        <GlassCard className="space-y-3 p-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-4 text-accent-foreground animate-pulse" />
              <span>1-Click Demo Shortcuts</span>
            </span>
            <Pill tone="teal">Instant Access</Pill>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo("PATIENT", "sinthana711@gmail.com", "Patient123!")}
              className="glass p-2.5 rounded-xl text-center space-y-1 hover:border-primary/40 transition group"
            >
              <UserRound className="size-5 mx-auto text-primary group-hover:scale-110 transition" />
              <p className="text-[11px] font-bold">Patient</p>
            </button>

            <button
              onClick={() => handleQuickDemo("DOCTOR", "doctor@clinic.com", "DoctorPassword123!")}
              className="glass p-2.5 rounded-xl text-center space-y-1 hover:border-teal/40 transition group"
            >
              <Stethoscope className="size-5 mx-auto text-teal group-hover:scale-110 transition" />
              <p className="text-[11px] font-bold">Doctor</p>
            </button>

            <button
              onClick={() => handleQuickDemo("ADMIN", "admin@clinic.com", "AdminPassword123!")}
              className="glass p-2.5 rounded-xl text-center space-y-1 hover:border-magenta/40 transition group"
            >
              <Shield className="size-5 mx-auto text-magenta group-hover:scale-110 transition" />
              <p className="text-[11px] font-bold">Admin</p>
            </button>
          </div>
        </GlassCard>

        {/* Login Form Card */}
        <GlassCard className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email Address">
              <div className="relative">
                <Mail className="size-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <KeyRound className="size-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

            <Btn
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-full py-3 text-sm font-bold shadow-lg mt-2"
            >
              <span>{submitting ? "Authenticating..." : "Sign In to PulseCare"}</span>
              <ArrowRight className="size-4" />
            </Btn>
          </form>

          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Don't have an account yet?{" "}
              <button
                onClick={onSwitchToRegister}
                className="font-bold text-primary hover:underline ml-1"
              >
                Create Account
              </button>
            </p>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
