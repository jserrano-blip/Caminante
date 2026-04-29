import { useState } from "react";
import { useApp } from "../context/AppContext";

type Mode = "login" | "register";

function dynamicGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function LoginScreen() {
  const { loginEmail, loginAsGuest, showToast } = useApp();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    setError(undefined);

    if (!email || !email.includes("@")) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (mode === "login") {
      // Demo: si la contraseña es "demo" → ok; si es "unconfirmed" → error de correo no confirmado.
      if (password === "unconfirmed") {
        setError(
          "Tu correo no está confirmado. Revisa tu bandeja para completar el registro.",
        );
        return;
      }
      if (password.length < 4) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }
      loginEmail(email);
      return;
    }
    // register
    if (!name) {
      setError("Ingresa tu nombre completo.");
      return;
    }
    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    showToast("Cuenta creada · revisa tu correo");
    loginEmail(email);
  };

  return (
    <div className="flex h-full flex-col bg-cream-100">
      <div className="flex flex-1 flex-col px-6 pt-10">
        <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-wine">
          Caminante
        </div>
        <h1 className="mt-2 font-serif text-[30px] leading-tight text-ink">
          {dynamicGreeting()}
          <span className="text-wine">.</span>
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Entra a tu cuenta para reservar viajes, gestionar tu Caminante Pass y
          acumular puntos Camina+.
        </p>

        <div className="mt-6 inline-flex self-start rounded-full bg-white p-1 shadow-card">
          <button
            onClick={() => setMode("login")}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
              mode === "login" ? "bg-wine text-cream-50" : "text-ink"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMode("register")}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
              mode === "register" ? "bg-wine text-cream-50" : "text-ink"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {mode === "register" && (
            <Field
              label="Nombre completo"
              value={name}
              onChange={setName}
              placeholder="Mariana López"
            />
          )}
          <Field
            label="Correo electrónico"
            value={email}
            onChange={setEmail}
            placeholder="tu@correo.com"
            type="email"
          />
          <Field
            label="Contraseña"
            value={password}
            onChange={setPassword}
            placeholder="•••••••"
            type="password"
            hint={
              mode === "login"
                ? "Tip demo: cualquier contraseña ≥4 letras inicia sesión. Usa 'unconfirmed' para ver el flujo de error."
                : undefined
            }
          />
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-wine/30 bg-wine/10 px-3 py-2 text-[11px] font-semibold text-wine">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          className="mt-5 w-full rounded-xl bg-wine py-3.5 text-[14px] font-semibold text-cream-50 hover:bg-wine-700"
        >
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>

        {mode === "login" && (
          <button className="mt-3 w-full text-[12px] text-ink-muted">
            ¿Olvidaste tu contraseña?
          </button>
        )}
      </div>

      <div className="px-6 pb-8">
        <div className="my-2 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          <span className="h-px flex-1 bg-ink/15" />
          o
          <span className="h-px flex-1 bg-ink/15" />
        </div>
        <button
          onClick={loginAsGuest}
          className="w-full rounded-xl border border-ink/15 bg-white py-3 text-[13px] font-semibold text-ink"
        >
          Continuar como invitado
        </button>
        <p className="mt-2 text-center text-[10px] text-ink-muted">
          Como invitado puedes reservar boletos, pero no acumulas puntos
          Camina+.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-3 text-[14px] text-ink outline-none focus:border-wine"
      />
      {hint && <span className="mt-1 block text-[10px] text-ink-muted">{hint}</span>}
    </label>
  );
}
