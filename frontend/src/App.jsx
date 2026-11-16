import React, { useEffect, useState } from "react";
import { getAdminDashboard, register, restoreSession, sendPasswordResetEmail, sendVerificationEmail, signIn, signOut } from "./firebaseAuth.js";

function PlaneMark({ className = "" }) {
  return <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m28 4-8.2 24-4.6-10.8L4 12.6 28 4Z" fill="currentColor" /><path d="m15.2 17.2 6.1-6.1" stroke="#F7F7F3" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

function Field({ label, id, ...props }) {
  return <label className="field" htmlFor={id}><span>{label}</span><input id={id} {...props} /></label>;
}

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [mode, setMode] = useState("login");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [email, setEmail] = useState("");
  const isAdminRoute = pathname === "/admin/login" || pathname === "/admin";

  function navigate(path) {
    window.history.pushState({}, "", path);
    setPathname(path);
    setError("");
    setNotice("");
  }

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    restoreSession()
      .then(async (result) => {
        if (!active) return;
        if (!result) {
          setSession(null);
          setProfile(null);
          setAdminDashboard(null);
          return;
        }
        if (isAdminRoute) {
          try {
            const dashboard = await getAdminDashboard(result.session.idToken);
            if (!active) return;
            setAdminDashboard(dashboard);
            setSession(result.session);
            setProfile(result.user);
            if (window.location.pathname === "/admin/login") navigate("/admin");
          } catch (reason) {
            signOut();
            if (active) {
              setSession(null);
              setProfile(null);
              setAdminDashboard(null);
              setError(reason.message);
            }
            return;
          } finally {
            if (active) setLoading(false);
          }
          return;
        }
        setSession(result.session);
        setProfile(result.user);
      })
      .catch((reason) => {
        if (!active) return;
        if (isAdminRoute) {
          signOut();
          setSession(null);
          setProfile(null);
          setAdminDashboard(null);
        }
        setError(reason.message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAdminRoute]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") || "").trim();
    const emailAddress = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    if (!isAdminRoute && mode === "register" && password !== form.get("confirmPassword")) {
      setError("Those passwords do not match yet.");
      return;
    }

    setSubmitting(true);
    try {
      if (!isAdminRoute && mode === "reset") {
        await sendPasswordResetEmail(emailAddress);
        setNotice("If an account exists for that email, a password reset link will be sent. Check your inbox and spam folder.");
        return;
      }
      const result = !isAdminRoute && mode === "register"
        ? await register({ displayName, email: emailAddress, password })
        : await signIn({ email: emailAddress, password });
      if (isAdminRoute) {
        try {
          const dashboard = await getAdminDashboard(result.session.idToken);
          setAdminDashboard(dashboard);
        } catch (reason) {
          signOut();
          setError(reason.message);
          return;
        }
        setSession(result.session);
        setProfile(result.user);
        navigate("/admin");
        return;
      }
      if (result.user?.role === "admin") {
        signOut();
        setSession(null);
        setProfile(null);
        setAdminDashboard(null);
        navigate("/admin/login");
        setNotice("This account has admin access. Sign in here to continue to the admin area.");
        return;
      }
      setSession(result.session);
      setProfile(result.user);
      setAdminDashboard(null);
      setNotice(mode === "register" ? "Your account is ready. Welcome aboard!" : "You are signed in. Welcome back!");
    } catch (reason) {
      setError(reason.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSignOut() {
    signOut();
    setSession(null);
    setProfile(null);
    setAdminDashboard(null);
    setMode("login");
    setError("");
    navigate(isAdminRoute ? "/admin/login" : "/login");
    setNotice("You have been signed out.");
  }

  async function handleSendVerification() {
    if (!session?.idToken) return;
    setVerificationBusy(true);
    setError("");
    setNotice("");
    try {
      await sendVerificationEmail(session.idToken);
      setNotice("Verification email sent. Check your inbox and spam folder.");
    } catch (reason) {
      setError(reason.message || "Could not send the verification email.");
    } finally {
      setVerificationBusy(false);
    }
  }

  if (loading) return <main className="loading-screen"><span className="loader" />Checking your session…</main>;

  if (session) {
    const displayName = profile?.displayName || session.displayName || session.email?.split("@")[0] || "traveller";
    if (pathname === "/admin" && adminDashboard) {
      return (
        <main className="member-page">
          <header className="topbar"><a className="brand" href="/admin" onClick={(event) => { event.preventDefault(); navigate("/admin"); }}><span className="brand-mark"><PlaneMark /></span>wayfarer<span className="brand-period">.</span><span className="admin-badge">ADMIN</span></a><button className="text-button" type="button" onClick={handleSignOut}>Sign out <span aria-hidden="true">↗</span></button></header>
          <section className="welcome-card" id="admin-dashboard">
            <div className="welcome-copy"><span className="eyebrow"><span className="status-dot" /> ADMIN ACCESS VERIFIED</span><h1>Welcome,<br /><em>{adminDashboard.admin.displayName || displayName}.</em></h1><p>You are signed in with admin permissions. This is the protected admin starting point; management features can be added here later.</p><div className="account-chip"><span className="avatar">A</span><span><strong>{adminDashboard.admin.email || session.email}</strong><small>Role: {adminDashboard.admin.role}</small></span></div></div>
            <div className="welcome-art" aria-hidden="true"><div className="sun" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-label"><span>WAYFARER / ADMIN</span><PlaneMark /><strong>Manage<br />the journey.</strong></div><span className="art-coordinate">PROTECTED AREA</span></div>
          </section>
        </main>
      );
    }
    return (
      <main className="member-page">
        <header className="topbar"><a className="brand" href="#home"><span className="brand-mark"><PlaneMark /></span>wayfarer<span className="brand-period">.</span></a><button className="text-button" type="button" onClick={handleSignOut}>Sign out <span aria-hidden="true">↗</span></button></header>
        <section className="welcome-card" id="home">
          <div className="welcome-copy"><span className="eyebrow"><span className="status-dot" /> YOU’RE SIGNED IN</span><h1>Welcome aboard,<br /><em>{displayName}.</em></h1><p>Your account is connected to Wayfarer. This is your starting point—your bookings and travel tools can go here next.</p><div className="account-chip"><span className="avatar">{displayName.charAt(0).toUpperCase()}</span><span><strong>{displayName}</strong><small>{profile?.email || session.email}</small></span></div>{profile?.emailVerified !== true && <div className="verify-box"><p>Verify your email before admin setup. If you already clicked the link, sign out and sign in again to refresh your status.</p><button className="verify-button" type="button" disabled={verificationBusy} onClick={handleSendVerification}>{verificationBusy ? "Sending…" : "Send verification email"}</button>{error && <p className="verify-feedback error-message" role="alert">{error}</p>}{notice && <p className="verify-feedback success-message" role="status">{notice}</p>}</div>}</div>
          <div className="welcome-art" aria-hidden="true"><div className="sun" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-label"><span>01 / YOUR JOURNEY</span><PlaneMark /><strong>Somewhere<br />wonderful.</strong></div><span className="art-coordinate">36° 10' N&nbsp; 115° 08' W</span></div>
        </section>
        <section className="next-step"><div><span className="eyebrow">THE NEXT CHAPTER</span><h2>Your travel dashboard starts here.</h2><p>Authentication is connected. You can now build your bookings experience on top of this signed-in screen.</p></div><span className="next-arrow" aria-hidden="true">↗</span></section>
      </main>
    );
  }

  const isRegister = mode === "register";
  const isReset = mode === "reset";
  return (
    <main className="auth-page">
      <section className="visual-panel" aria-label="Travel inspiration">
        <div className="visual-top"><a className="brand brand-light" href="#home"><span className="brand-mark"><PlaneMark /></span>wayfarer<span className="brand-period">.</span></a><span className="issue-label">THE WORLD, OPEN</span></div>
        <div className="destination-copy"><span className="eyebrow light-eyebrow">A LITTLE FURTHER, A LOT MORE YOU</span><h1>Go where<br />you <em>feel</em> alive.</h1><p>Find your next place in the world.<br />We’ll help you get there.</p></div>
        <div className="photo-caption"><span className="caption-line" /><span>THE QUIETER SIDE OF THE ITALIAN COAST</span><span className="caption-index">01 — 04</span></div><div className="image-credit">A journey is waiting</div>
      </section>

      <section className="form-panel">
        <div className="mobile-brand"><a className="brand" href={isAdminRoute ? "/admin/login" : "/login"} onClick={(event) => { event.preventDefault(); navigate(isAdminRoute ? "/admin/login" : "/login"); }}><span className="brand-mark"><PlaneMark /></span>wayfarer<span className="brand-period">.</span></a></div>
        <div className="form-wrap">
          <div className="form-heading"><span className="eyebrow">{isAdminRoute ? "WAYFARER ADMIN" : isReset ? "ACCOUNT RECOVERY" : "YOUR NEXT CHAPTER"}</span><h2>{isAdminRoute ? "Admin" : isReset ? "Reset your" : isRegister ? "Make room for" : "Welcome"}<br /><em>{isAdminRoute ? "sign in." : isReset ? "password." : isRegister ? "somewhere new." : "back."}</em></h2><p>{isAdminRoute ? "Sign in with your approved admin account to access the protected dashboard." : isReset ? "Enter the email address linked to your account and we’ll send a password reset link." : isRegister ? "Create an account and keep all your journeys in one place." : "Sign in to pick up where your next adventure begins."}</p></div>
          {!isAdminRoute && !isReset && <div className="mode-switch" role="tablist" aria-label="Account options"><button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? "active" : ""} onClick={() => switchMode("login")}>Sign in</button><button type="button" role="tab" aria-selected={isRegister} className={isRegister ? "active" : ""} onClick={() => switchMode("register")}>Create account</button></div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isAdminRoute && isRegister && <Field label="Full name" id="displayName" name="displayName" type="text" autoComplete="name" placeholder="How should we greet you?" required maxLength={80} />}
            <Field label="Email address" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            {!isReset && <label className="field" htmlFor="password"><span>Password</span><span className="password-wrap"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} placeholder="At least 6 characters" minLength={6} required /><button className="show-password" type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button></span></label>}
            {!isAdminRoute && !isRegister && !isReset && <button className="forgot-password" type="button" onClick={() => switchMode("reset")}>Forgot password?</button>}
            {!isAdminRoute && isRegister && <Field label="Confirm password" id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Enter your password again" minLength={6} required />}
            {error && <p className="form-message error-message" role="alert">{error}</p>}{notice && <p className="form-message success-message" role="status">{notice}</p>}
            <button className="submit-button" type="submit" disabled={submitting}>{submitting ? <><span className="button-loader" />{isReset ? "Sending reset link…" : !isAdminRoute && isRegister ? "Creating your account…" : "Signing you in…"}</> : <>{isReset ? "Send reset link" : !isAdminRoute && isRegister ? "Create account" : isAdminRoute ? "Sign in to admin" : "Sign in to your account"}<span aria-hidden="true">↗</span></>}</button>
          </form>
          {!isAdminRoute && isReset && <button className="back-link" type="button" onClick={() => switchMode("login")}>← Back to sign in</button>}
          <p className="secure-note"><span className="lock-icon" aria-hidden="true">⌑</span> {isAdminRoute ? "Admin access is verified by the server." : "Your account is securely managed by Firebase."}</p>
          {!isAdminRoute && <button className="back-link" type="button" onClick={() => navigate("/admin/login")}>Admin sign in →</button>}
          {isAdminRoute && <button className="back-link" type="button" onClick={() => { setMode("login"); navigate("/login"); }}>← Back to regular sign in</button>}
        </div>
        <footer className="form-footer"><span>© 2026 WAYFARER TRAVEL</span><span>MADE FOR THE JOURNEY</span></footer>
      </section>
    </main>
  );
}