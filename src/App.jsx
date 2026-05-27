import { useState, useEffect, useCallback } from "react";

// ============================================================
// CONFIG — Credenciais do Supabase (projeto moldpeople-dev)
// ============================================================
const SUPABASE_URL = "https://pmatrdykalqrcyaaifeo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYXRyZHlrYWxxcmN5YWFpZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODA3OTAsImV4cCI6MjA5NTQ1Njc5MH0.WKI686kyrJc9eEJlNxzNlaL6znkv-T_66kTyrSjq8Vo";

// Modo demo desativado — Supabase configurado


// ============================================================
// SUPABASE CLIENT (sem SDK externo)
// ============================================================
const supabase = {
  _headers() {
    const h = {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    };
    const token = localStorage.getItem("mp_access_token");
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  },

  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error_description || err.msg || "Credenciais inválidas");
    }
    const data = await res.json();
    localStorage.setItem("mp_access_token", data.access_token);
    localStorage.setItem("mp_refresh_token", data.refresh_token);
    return data;
  },

  async signOut() {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: this._headers(),
      });
    } catch (_) {}
    localStorage.removeItem("mp_access_token");
    localStorage.removeItem("mp_refresh_token");
  },

  async getUser() {
    const token = localStorage.getItem("mp_access_token");
    if (!token) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: this._headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (_) {
      return null;
    }
  },

  async getUserProfile(userId) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=id,email,nome,cargo,role,gestor_id`,
        { headers: this._headers() }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
    } catch (_) {
      return null;
    }
  },
};

// ============================================================
// MÓDULOS — Registry da plataforma
// ============================================================
const MODULES = [
  {
    id: "moldaway",
    name: "MoldAway",
    subtitle: "Descansos & Períodos",
    icon: "🏖️",
    color: "#0E7C7B",
    status: "active",
    description: "Gestão de férias, day-offs, períodos aquisitivos e saldos",
  },
  {
    id: "mold1a1",
    name: "Mold1a1",
    subtitle: "Reuniões 1:1",
    icon: "🤝",
    color: "#0052CC",
    status: "coming",
    description: "Gestão de reuniões 1:1, clima, compromissos e desenvolvimento",
  },
  {
    id: "eai",
    name: "EAI",
    subtitle: "Engajamento",
    icon: "📊",
    color: "#6B4C93",
    status: "coming",
    description: "Pesquisas de engajamento, pulso e análise de clima organizacional",
  },
  {
    id: "pesquisas",
    name: "Pesquisas",
    subtitle: "Questionários",
    icon: "📝",
    color: "#F25400",
    status: "coming",
    description: "Pesquisas customizáveis, avaliações e coleta de dados",
  },
];

// ============================================================
// THEME
// ============================================================
const T = {
  bg: "#F0F2F5",
  card: "#FFFFFF",
  sidebar: "#0F1A2E",
  primary: "#0052CC",
  accent: "#F25400",
  text: "#172B4D",
  muted: "#6B778C",
  border: "#DFE1E6",
  green: "#36B37E",
  radius: "10px",
  shadow: "0 1px 4px rgba(23,43,77,.10), 0 0 1px rgba(23,43,77,.08)",
  shadowLg: "0 8px 32px rgba(23,43,77,.13), 0 1px 4px rgba(23,43,77,.08)",
};

// ============================================================
// TELA DE LOGIN
// ============================================================
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await supabase.signIn(email, password);
      const authUser = await supabase.getUser();
      const profile = await supabase.getUserProfile(authUser.id);
      if (!profile) throw new Error("Perfil não encontrado. Contate o administrador.");
      onLogin(profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.loginWrapper}>
      {/* Lado esquerdo — branding */}
      <div style={S.loginLeft}>
        <div style={S.loginBrand}>
          <div style={S.logoMark}>M</div>
          <div>
            <div style={S.loginLogoText}>
              Mold<span style={{ color: "#FFB380" }}>People</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>
              Ecossistema de Gestão de Pessoas
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 420 }}>
          <h1 style={S.loginH1}>
            Gestão de pessoas integrada e inteligente
          </h1>
          <p style={{ fontSize: 15, opacity: 0.7, lineHeight: 1.6, marginTop: 12 }}>
            Reuniões 1:1, férias, engajamento e pesquisas — tudo em um só lugar.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 36 }}>
          {MODULES.map((m) => (
            <div key={m.id} style={S.loginModuleChip}>
              <span>{m.icon}</span>
              <span style={{ fontWeight: 600 }}>{m.name}</span>
              <span style={{ color: "rgba(255,255,255,.5)", fontSize: 11 }}>
                {m.subtitle}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={S.loginRight}>
        <div style={S.loginCard}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22, color: T.text }}>
            Entrar na plataforma
          </h2>

          <label style={S.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={S.input}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          <label style={{ ...S.label, marginTop: 14 }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={S.input}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          {error && <div style={S.errorBox}>{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...S.btnPrimary, marginTop: 18, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
        <div style={{ marginTop: 18, fontSize: 11, color: T.muted, textAlign: "center" }}>
          MoldPeople © {new Date().getFullYear()} — v0.1.0
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HUB DE MÓDULOS (home após login)
// ============================================================
function ModuleHub({ user, onSelectModule }) {
  const roleLabel = { rh: "G&G / Liderança", gestor: "Gestor", user: "Colaborador" };

  return (
    <div style={{ padding: "32px 28px", maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.3 }}>
          Olá, {user.nome?.split(" ")[0]} 👋
        </h1>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
          {roleLabel[user.role] || user.role}
          {user.cargo ? ` · ${user.cargo}` : ""}
        </p>
      </div>

      <div style={S.hubGrid}>
        {MODULES.map((m) => {
          const isActive = m.status === "active";
          return (
            <div
              key={m.id}
              onClick={() => isActive && onSelectModule(m.id)}
              style={{
                ...S.hubCard,
                cursor: isActive ? "pointer" : "default",
                opacity: isActive ? 1 : 0.5,
                borderTopColor: isActive ? m.color : T.border,
              }}
              onMouseEnter={(e) => {
                if (isActive) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = T.shadowLg;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = T.shadow;
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${m.color}15`, color: m.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, marginBottom: 12,
              }}>
                {m.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{m.name}</div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>{m.subtitle}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
                {m.description}
              </div>
              <div style={{
                position: "absolute", top: 12, right: 12,
                fontSize: 9.5, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                background: isActive ? "#E3FCEF" : "rgba(0,0,0,.05)",
                color: isActive ? T.green : T.muted,
                textTransform: "uppercase", letterSpacing: 0.3,
              }}>
                {isActive ? "Ativo" : "Em breve"}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 24, padding: "12px 16px", borderRadius: 8,
        background: "#EAE0F5", color: "#4A3370", fontSize: 12.5, lineHeight: 1.6,
      }}>
        <strong>💡 Dica:</strong> Novos módulos serão ativados progressivamente.
        Use a sidebar para navegar entre os módulos ativos.
      </div>
    </div>
  );
}

// ============================================================
// MOLDAWAY (módulo ativo — placeholder até hospedar o HTML)
// ============================================================
function MoldAwayModule({ user }) {
  return (
    <iframe
      src="/moldaway.html"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
      title="MoldAway"
    />
  );
}

// ============================================================
// SHELL — Contêiner principal da plataforma
// ============================================================
function PlatformShell({ user, onLogout }) {
  const [activeModule, setActiveModule] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const roleLabel = { rh: "G&G", gestor: "Gestor", user: "Colaborador" };

  const renderContent = () => {
    if (!activeModule) return <ModuleHub user={user} onSelectModule={setActiveModule} />;
    if (activeModule === "moldaway") return <MoldAwayModule user={user} />;
    return (
      <div style={{ padding: 40, textAlign: "center", color: T.muted }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
        <h3 style={{ marginBottom: 8 }}>Módulo em desenvolvimento</h3>
        <p style={{ fontSize: 13 }}>Este módulo será ativado em breve.</p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <nav style={{
        width: collapsed ? 64 : 240, background: T.sidebar, color: "#fff",
        display: "flex", flexDirection: "column", flexShrink: 0,
        transition: "width .2s ease", overflow: "hidden",
      }}>
        {/* Logo */}
        <div
          onClick={() => setActiveModule(null)}
          style={{
            padding: "0 16px", height: 60, display: "flex", alignItems: "center",
            gap: 10, borderBottom: "1px solid rgba(255,255,255,.06)", cursor: "pointer",
          }}
        >
          <div style={S.logoMark}>M</div>
          {!collapsed && (
            <div style={{ fontSize: 16, fontWeight: 800, whiteSpace: "nowrap" }}>
              Mold<span style={{ color: "#FFB380" }}>People</span>
            </div>
          )}
        </div>

        {/* Perfil */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.06)",
        }}>
          <div style={S.avatar}>{(user.nome || "U")[0]}</div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.nome?.split(" ").slice(0, 2).join(" ")}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>
                {roleLabel[user.role] || user.role}
              </div>
            </div>
          )}
        </div>

        {/* Navegação */}
        <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          <div
            onClick={() => setActiveModule(null)}
            style={{
              ...S.navItem,
              ...(activeModule === null ? S.navItemActive : {}),
            }}
          >
            <span style={S.navIcon}>🏠</span>
            {!collapsed && <span>Início</span>}
          </div>

          {!collapsed && (
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: 1, padding: "14px 12px 4px" }}>
              Módulos
            </div>
          )}

          {MODULES.map((m) => {
            const isActive = m.status === "active";
            const isSelected = activeModule === m.id;
            return (
              <div
                key={m.id}
                onClick={() => isActive && setActiveModule(m.id)}
                title={collapsed ? m.name : ""}
                style={{
                  ...S.navItem,
                  ...(isSelected ? S.navItemActive : {}),
                  opacity: isActive ? 1 : 0.4,
                  cursor: isActive ? "pointer" : "default",
                }}
              >
                <span style={S.navIcon}>{m.icon}</span>
                {!collapsed && (
                  <>
                    <span>{m.name}</span>
                    {!isActive && (
                      <span style={{
                        marginLeft: "auto", fontSize: 9, fontWeight: 700,
                        padding: "1px 6px", borderRadius: 4,
                        background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.3)",
                        textTransform: "uppercase", letterSpacing: 0.3,
                      }}>
                        breve
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div style={{
          padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.06)",
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}>
          {!collapsed && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>v0.1.0</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.4)", borderRadius: 5, padding: "4px 8px",
              cursor: "pointer", fontSize: 10, fontFamily: "'DM Sans', sans-serif",
            }}
            title={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{
          height: 60, background: T.card, borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", flexShrink: 0,
        }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>
            {activeModule ? MODULES.find((m) => m.id === activeModule)?.name : "Início"}
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: "6px 14px", borderRadius: 7, border: `1px solid ${T.border}`,
              background: T.bg, color: T.text, fontSize: 12.5, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Sair
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>{renderContent()}</div>
      </div>
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const authUser = await supabase.getUser();
      if (authUser) {
        const profile = await supabase.getUserProfile(authUser.id);
        if (profile) setUser(profile);
      }
      setChecking(false);
    };
    checkSession();
  }, []);

  const handleLogin = useCallback((profile) => {
    setUser(profile);
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.signOut();
    setUser(null);
  }, []);

  if (checking) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100vh", background: T.bg,
      }}>
        <div style={S.logoMark}>M</div>
        <div style={{ marginTop: 12, color: T.muted, fontSize: 13 }}>Carregando...</div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;
  return <PlatformShell user={user} onLogout={handleLogout} />;
}

// ============================================================
// STYLES
// ============================================================
const S = {
  loginWrapper: {
    display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif",
  },
  loginLeft: {
    flex: 1,
    background: "linear-gradient(145deg, #0F1A2E 0%, #1A2A4A 55%, #0052CC 100%)",
    color: "#fff", display: "flex", flexDirection: "column",
    justifyContent: "center", padding: "48px 44px",
  },
  loginRight: {
    width: 420, background: T.bg, display: "flex", flexDirection: "column",
    justifyContent: "center", alignItems: "center", padding: 32,
  },
  loginCard: {
    background: T.card, borderRadius: 14, padding: "32px 28px",
    boxShadow: T.shadowLg, width: "100%", maxWidth: 360,
  },
  loginBrand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 44 },
  loginLogoText: { fontSize: 21, fontWeight: 800, letterSpacing: -0.5 },
  loginH1: { fontSize: 28, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.5 },
  loginModuleChip: {
    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
    borderRadius: 8, background: "rgba(255,255,255,.08)", fontSize: 12.5,
    border: "1px solid rgba(255,255,255,.1)",
  },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 5 },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box",
  },
  errorBox: {
    marginTop: 10, padding: "8px 10px", borderRadius: 6,
    background: "#FFEBE6", color: "#BF2600", fontSize: 12.5, fontWeight: 500,
  },
  btnPrimary: {
    width: "100%", padding: "11px 16px", borderRadius: 8,
    background: T.primary, color: "#fff", border: "none",
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  hubGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 14,
  },
  hubCard: {
    background: T.card, borderRadius: T.radius, padding: "20px 18px",
    boxShadow: T.shadow, transition: "all .2s ease",
    borderTop: "3px solid transparent", position: "relative",
  },
  logoMark: {
    width: 36, height: 36, background: T.accent, borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 15, color: "#fff", flexShrink: 0,
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(76,154,255,.2)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, color: "#4C9AFF", flexShrink: 0,
  },
  navItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
    borderRadius: 7, cursor: "pointer", color: "rgba(255,255,255,.55)",
    fontSize: 13.5, fontWeight: 500, transition: "all .15s", whiteSpace: "nowrap",
  },
  navItemActive: { background: "rgba(76,154,255,.15)", color: "#4C9AFF" },
  navIcon: { fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 },
};
