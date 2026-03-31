import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/common/PageTransition";
import { getDefaultRoute, useAuth } from "@/contexts/AuthContext";
import { SignupRole } from "@/types";

export function LoginPage(): JSX.Element {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [role, setRole] = useState<SignupRole>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (mode === "login") {
        const user = await login({ email, password });
        const redirectTo = (location.state as { from?: Location })?.from?.pathname;
        navigate(redirectTo ?? getDefaultRoute(user), { replace: true });
      } else {
        const result = await register({ name, email, password, role });
        if (result.user) {
          navigate(getDefaultRoute(result.user), { replace: true });
        } else {
          setNotice(result.message ?? "Account created. Verify your email and then sign in.");
          setMode("login");
        }
      }
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : mode === "login"
            ? "Unable to sign in."
            : "Unable to create your account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-soft-grid">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 md:px-6">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-8 md:p-10"
          >
            <span className="tag">Role-based access</span>
            <h1 className="mt-5 font-heading text-5xl font-semibold tracking-[-0.04em] text-ink">
              Premium pet operations for customers, admins, and super admins.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Supabase Auth now powers identity for customers and admins. Profiles and approvals come from the
              database, so each workspace unlocks from real role data instead of mock emails.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Customer", "Shoppers can browse, save favorites, and manage personal activity."],
                ["Admin", "Admins can request access and manage products once a superadmin approves them."],
                ["Super Admin", "A manually promoted account can approve admins and monitor platform analytics."],
              ].map(([label, copy]) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -5 }}
                  className="stat-panel text-left"
                >
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="mt-2 text-sm text-slate-500">{copy}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-8 md:p-10"
          >
            <div className="flex gap-2 rounded-full bg-[#f7f0e4] p-1">
              {[
                ["login", "Sign in"],
                ["signup", "Create account"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value as "login" | "signup");
                    setError("");
                    setNotice("");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mode === value ? "bg-[#2f4f6f] text-white" : "text-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
              {mode === "login" ? "Single Login" : "Supabase Signup"}
            </p>
            <h2 className="mt-3 font-heading text-4xl font-semibold text-ink">
              {mode === "login" ? "Access your workspace" : "Create your HappyPets account"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === "signup" ? (
                <>
                  <label className="field">
                    <span>Full Name</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="input"
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Account Type</span>
                    <select
                      value={role}
                      onChange={(event) => setRole(event.target.value as SignupRole)}
                      className="input"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin Request</option>
                    </select>
                  </label>
                </>
              ) : null}

              <label className="field">
                <span>Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input"
                  type="email"
                  required
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input"
                  type="password"
                  required
                />
              </label>

              {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
              {error ? <p className="text-sm text-rose-500">{error}</p> : null}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="primary-button w-full justify-center"
              >
                {submitting
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                    ? "Login"
                    : "Create account"}
              </motion.button>
            </form>

            <div className="mt-6 rounded-[24px] bg-[#faf5ea] p-5 text-sm leading-7 text-slate-600">
              Admin signups are created as pending requests. To create the first superadmin, sign up normally and then
              promote that profile with the SQL in the Supabase setup docs.
            </div>
          </motion.section>
        </div>
      </div>
    </PageTransition>
  );
}
