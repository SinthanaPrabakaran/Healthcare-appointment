import React, { useState } from "react";
import { Stethoscope, KeyRound, Mail, User, ArrowRight, UserRound, Shield, Sparkles } from "lucide-react";
import { useAuth, type UserRole } from "../../context/AuthContext";
import { Btn, Field, GlassCard, Pill, inputClass } from "../pulse/ui";

export function Register({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("PATIENT");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await register(name, email, password, role);
    } catch (err) {
      // Toast handled by AuthContext
    } finally {
      setSubmitting(false);
    }
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
            Create Account
          </h1>
          <p className="text-xs text-muted-foreground">
            Join PulseCare for instant consultation booking, AI triage, and visit tracking
          </p>
        </div>

        {/* Register Form Card */}
        <GlassCard className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Pill Selector */}
            <Field label="Select Account Type">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("PATIENT")}
                  className={`p-2.5 rounded-xl text-center space-y-1 transition border ${
                    role === "PATIENT"
                      ? "bg-primary/20 border-primary text-primary font-bold shadow-md"
                      : "glass border-border text-muted-foreground"
                  }`}
                >
                  <UserRound className="size-4 mx-auto" />
                  <p className="text-xs">Patient</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("DOCTOR")}
                  className={`p-2.5 rounded-xl text-center space-y-1 transition border ${
                    role === "DOCTOR"
                      ? "bg-teal/20 border-teal text-accent-foreground font-bold shadow-md"
                      : "glass border-border text-muted-foreground"
                  }`}
                >
                  <Stethoscope className="size-4 mx-auto" />
                  <p className="text-xs">Doctor</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`p-2.5 rounded-xl text-center space-y-1 transition border ${
                    role === "ADMIN"
                      ? "bg-magenta/20 border-magenta text-magenta font-bold shadow-md"
                      : "glass border-border text-muted-foreground"
                  }`}
                >
                  <Shield className="size-4 mx-auto" />
                  <p className="text-xs">Admin</p>
                </button>
              </div>
            </Field>

            <Field label="Full Name">
              <div className="relative">
                <User className="size-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Sinthana K"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

            <Field label="Email Address">
              <div className="relative">
                <Mail className="size-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
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
                  minLength={6}
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
              <span>{submitting ? "Registering..." : "Create Account & Log In"}</span>
              <ArrowRight className="size-4" />
            </Btn>
          </form>

          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="font-bold text-primary hover:underline ml-1"
              >
                Sign In
              </button>
            </p>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
