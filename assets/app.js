import {
  events,
  highlights,
  modules,
  sessions,
} from "./data.js";
import { supabase } from "./supabase-client.js";

const page = document.body.dataset.page;
const content = document.getElementById("page-content");
const header = document.getElementById("site-header");
const footer = document.getElementById("site-footer");
const params = new URLSearchParams(window.location.search);
window.supabase = supabase;

const routeMap = {
  home: "index.html",
  modules: "modules.html",
  sessions: "sessions.html",
  events: "evenements.html",
  signup: "signup.html",
  login: "login.html",
  account: "mon-espace.html",
  admin: "admin.html",
  adminLogin: "admin-login.html",
};

const adminState = {
  inventory: [],
  neededEquipment: [],
  events: [],
  modules: [],
  sessionModules: [],
  sessions: [],
  registrations: [],
};

let adminDom = null;

const adminFormLabels = {
  inventory: {
    createTitle: "Ajouter un item",
    editTitle: "Modifier un item",
    createButton: "Ajouter à l’inventaire",
    editButton: "Enregistrer les changements",
  },
  neededEquipment: {
    createTitle: "Ajouter un besoin",
    editTitle: "Modifier un besoin",
    createButton: "Ajouter au suivi",
    editButton: "Enregistrer les changements",
  },
  event: {
    createTitle: "Ajouter un événement",
    editTitle: "Modifier un événement",
    createButton: "Publier l’événement",
    editButton: "Enregistrer les changements",
  },
  session: {
    createTitle: "Ajouter une session",
    editTitle: "Modifier une session",
    createButton: "Créer la session",
    editButton: "Enregistrer les changements",
  },
};

const registrationStatusOptions = [
  "registered",
  "confirmed",
  "waitlisted",
  "cancelled",
];

const navItems = [
  { key: "home", href: routeMap.home, label: "Accueil" },
  { key: "modules", href: routeMap.modules, label: "Modules" },
  { key: "sessions", href: routeMap.sessions, label: "Sessions" },
  { key: "events", href: routeMap.events, label: "Événements" },
  { key: "admin", href: routeMap.admin, label: "Admin" },
];

const pageParent = {
  "module-detail": "modules",
  registration: "sessions",
  signup: "login",
  account: "login",
  "admin-login": "admin",
};

renderShell();
renderPage();
bindInteractions();
hydrateAuthNavigation();
hydrateEventsPage();
hydrateHomeEventsSection();
hydrateSessionsPage();
hydrateRegistrationPage();
hydrateModuleDetailSessions();
hydrateSignupPage();
hydrateLoginPage();
hydrateUserDashboardPage();
hydrateAdminLoginPage();
hydrateAdminPage();

function renderShell() {
  const activeKey = pageParent[page] ?? page;

  header.innerHTML = `
    <nav class="navbar">
      <a class="brand-lockup" href="${routeMap.home}">
        <span class="brand-mark">42</span>
        <span>
          <strong>Fablab</strong>
          <small>Marseille</small>
        </span>
      </a>

      <button class="menu-toggle" type="button" aria-expanded="false" aria-label="Ouvrir le menu">
        Menu
      </button>

      <div class="nav-panel">
        <div class="nav-links">
          ${navItems
            .map(
              (item) => `
                <a class="nav-link ${item.key === activeKey ? "active" : ""}" href="${item.href}">
                  ${item.label}
                </a>
              `,
            )
            .join("")}
        </div>
        <div class="nav-actions">
          <a class="button button-secondary nav-cta" href="${routeMap.sessions}">Voir les sessions</a>
          <a class="button button-ghost nav-auth-link" id="nav-auth-link" href="${routeMap.login}">
            Connexion
          </a>
        </div>
      </div>
    </nav>
  `;

  footer.innerHTML = `
    <div>
      <p class="footer-title">Fablab 42 Marseille</p>
      <p class="footer-copy">
        Un atelier pour apprendre, fabriquer et partager des projets concrets.
      </p>
    </div>
    <div class="footer-links">
      <span>Modules</span>
      <span>Sessions</span>
      <span>Événements</span>
      <span>Admin</span>
    </div>
  `;
}

function renderPage() {
  switch (page) {
    case "home":
      document.title = "Fablab 42 Marseille";
      content.innerHTML = renderHomePage();
      break;
    case "modules":
      document.title = "Modules • Fablab 42 Marseille";
      content.innerHTML = renderModulesPage();
      break;
    case "module-detail":
      content.innerHTML = renderModuleDetailPage();
      break;
    case "sessions":
      document.title = "Sessions • Fablab 42 Marseille";
      content.innerHTML = renderSessionsPage();
      break;
    case "registration":
      content.innerHTML = renderRegistrationPage();
      break;
    case "events":
      document.title = "Événements • Fablab 42 Marseille";
      content.innerHTML = renderEventsPage();
      break;
    case "signup":
      document.title = "Inscription • Fablab 42 Marseille";
      content.innerHTML = renderSignupPage();
      break;
    case "login":
      document.title = "Connexion • Fablab 42 Marseille";
      content.innerHTML = renderLoginPage();
      break;
    case "account":
      document.title = "Mon espace • Fablab 42 Marseille";
      content.innerHTML = renderUserDashboardLoadingPage();
      break;
    case "admin":
      document.title = "Admin • Fablab 42 Marseille";
      content.innerHTML = renderAdminLoadingPage();
      break;
    case "admin-login":
      document.title = "Connexion admin • Fablab 42 Marseille";
      content.innerHTML = renderAdminLoginPage();
      break;
    default:
      content.innerHTML = renderNotFound();
      break;
  }
}

function renderHomePage() {
  const featuredEvent = events[0];

  return `
    <div class="page-flow">
      <section class="hero-card animate-rise">
        <div class="hero-copy">
          <span class="eyebrow">Fablab 42 Marseille</span>
          <h1>Imaginer, prototyper, expérimenter.</h1>
          <p>
            Un lieu où l’on apprend par la pratique, où l’on teste des idées rapidement,
            et où la technique reste toujours accessible, humaine et partagée.
          </p>
          <div class="hero-actions">
            <a class="button button-primary" href="${routeMap.sessions}">Découvrir les sessions</a>
            <a class="button button-ghost" href="${routeMap.modules}">Parcourir les modules</a>
          </div>
          <div class="hero-meta">
            <span class="meta-pill">Création concrète</span>
            <span class="meta-pill">Électronique et Arduino</span>
          </div>
        </div>

        <div class="hero-visual">
          <article class="hero-panel hero-panel-primary">
            <div class="hero-panel-header">
              <span>Prochain événement</span>
              <span>→</span>
            </div>
            <h3>${featuredEvent.title}</h3>
            <p>${featuredEvent.description}</p>
            <div class="hero-event-date">${formatShortDate(featuredEvent.date)}</div>
          </article>

          <div class="hero-stack">
            ${modules
              .map(
                (module) => `
                  <article class="hero-panel hero-panel-mini">
                    <span>${module.title}</span>
                    <p>${module.shortText}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section-card animate-rise">
        ${sectionHeading(
          "Rendez-vous",
          "Événements planifiés",
          "Des formats ouverts, des temps de démonstration et des rendez-vous accessibles pour découvrir le lieu en situation réelle.",
        )}
        <div class="card-grid three-columns" id="home-events-grid">
          ${renderEventsLoadingState("Chargement", "Récupération des prochains événements du fablab.")}
        </div>
        <div class="section-action">
          <a class="button button-ghost" href="${routeMap.events}">Tous les événements</a>
        </div>
      </section>

      <section class="section-card section-card-soft animate-rise">
        ${sectionHeading(
          "Modules",
          "Deux portes d’entrée pour commencer",
          "Le parcours démarre avec des bases claires, un rythme doux, et des objectifs immédiatement concrets.",
        )}
        <div class="card-grid two-columns">
          ${modules.map(renderModuleCard).join("")}
        </div>
      </section>

      <section class="feature-band animate-rise">
        <div class="feature-copy">
          ${sectionHeading(
            "Esprit du lieu",
            "Un fablab pensé comme un atelier vivant",
            "Le site présente le fablab comme un espace de pratique, de découverte et de progression. Il rassure les débutants tout en donnant envie de revenir.",
          )}
          <a class="button button-secondary" href="${routeMap.sessions}">Consulter les prochaines sessions</a>
        </div>
        <div class="feature-list">
          ${highlights
            .map(
              (item, index) => `
                <article class="feature-item">
                  <div class="feature-index">0${index + 1}</div>
                  <div>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="section-card animate-rise">
        ${sectionHeading(
          "Vue rapide",
          "Le site met en avant l’activité réelle du fablab",
          "Sessions, événements et fonctionnement sont déjà organisés pour accueillir plus tard une vraie logique d’inscription.",
        )}
        <div class="metrics-grid">
          <article class="metric-card">
            <strong>${sessions.length} sessions à venir</strong>
            <span>Une interface déjà prête pour réserver une place.</span>
          </article>
          <article class="metric-card">
            <strong>Admin crédible</strong>
            <span>Inventaire et besoins matériels visibles dès maintenant.</span>
          </article>
          <article class="metric-card">
            <strong>Design aéré</strong>
            <span>Une identité douce, éditoriale et chaleureuse sur mobile comme desktop.</span>
          </article>
        </div>
        <div class="section-action">
          <a class="button button-ghost" href="${routeMap.admin}">Explorer la structure admin</a>
        </div>
      </section>
    </div>
  `;
}

function renderModulesPage() {
  return `
    <div class="page-flow">
      <section class="page-hero animate-rise">
        ${sectionHeading(
          "Catalogue",
          "Modules disponibles",
          "Des formats d’initiation pensés pour comprendre, manipuler et construire des bases solides sans surcharge.",
        )}
      </section>

      <section class="card-grid two-columns">
        ${modules.map(renderModuleCard).join("")}
      </section>

      <section class="section-card section-card-soft animate-rise">
        ${sectionHeading(
          "Approche",
          "Une montée en compétence simple à suivre",
          "Chaque module pose un cadre clair : ce que l’on va voir, ce qu’il faut apporter et comment se préparer pour apprendre dans de bonnes conditions.",
        )}
      </section>
    </div>
  `;
}

function renderModuleDetailPage() {
  const moduleId = params.get("id");
  const module = modules.find((item) => item.id === moduleId);

  if (!module) {
    document.title = "Module introuvable • Fablab 42 Marseille";
    return renderEmptyPage(
      "Module",
      "Module introuvable",
      "Le module demandé n’a pas été trouvé. Revenez au catalogue pour parcourir les contenus disponibles.",
      routeMap.modules,
      "Retour aux modules",
    );
  }

  document.title = `${module.title} • Fablab 42 Marseille`;

  return `
    <div class="page-flow">
      <section class="detail-hero animate-rise">
        <div class="detail-copy">
          <span class="eyebrow">Détail module</span>
          <h1>${module.title}</h1>
          <p>${module.presentation}</p>
          <div class="tag-row">
            <span class="subtle-badge">${module.level}</span>
            ${module.focus.map((item) => `<span class="tag">${item}</span>`).join("")}
          </div>
        </div>

        <aside class="detail-aside">
          ${miniDetailCard("Objectifs", module.objectives)}
          ${miniDetailCard("Prérequis", module.prerequisites)}
          ${miniDetailCard("Durée", module.duration)}
        </aside>
      </section>

      <section class="detail-grid">
        <article class="info-card detail-card animate-rise">
          ${sectionHeading("Présentation", "Description", module.description)}
          <p class="detail-long-text">${module.mood}</p>
        </article>

        <article class="info-card detail-card animate-rise">
          ${sectionHeading(
            "Préparation",
            "Matériel à ramener",
            "Une préparation légère suffit pour arriver dans de bonnes conditions.",
          )}
          <ul class="detail-list">
            ${module.bring.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>

        <article class="info-card detail-card animate-rise">
          ${sectionHeading(
            "Cadre",
            "Prochaines sessions",
            "Un aperçu des dates déjà prévues pour ce module.",
          )}
          <div
            class="schedule-list"
            id="module-sessions-list"
            data-module-id="${module.id}"
            data-module-title="${module.title}"
          >
            ${renderModuleSessionsLoadingState()}
          </div>
        </article>
      </section>

      <div class="section-action">
        <a class="button button-primary" href="${routeMap.sessions}">Voir toutes les sessions</a>
      </div>
    </div>
  `;
}

function renderSessionsPage() {
  return `
    <div class="page-flow">
      <section class="page-hero animate-rise">
        ${sectionHeading(
          "Cours",
          "Sessions de cours",
          "L’interface d’inscription est déjà en place pour rendre le futur parcours crédible et immédiatement compréhensible.",
        )}
      </section>

      <section class="card-grid two-columns" id="sessions-grid">
        ${renderSessionsLoadingState()}
      </section>
    </div>
  `;
}

function renderRegistrationPage() {
  document.title = "Inscription • Fablab 42 Marseille";

  return `
    <div class="page-flow">
      <section class="registration-layout">
        <div class="section-card registration-card animate-rise">
          ${sectionHeading(
            "Inscription",
            "Réserver une place",
            "Une maquette crédible du futur formulaire d’inscription, déjà prête à évoluer vers une vraie logique backend.",
          )}

          <form class="signup-form" data-mock-registration>
            <label>
              Session souhaitée
              <select id="registration-session-select" name="session_id" required disabled>
                <option>Chargement des sessions...</option>
              </select>
            </label>
            <label>
              Prénom
              <input id="registration-first-name" name="first_name" type="text" placeholder="Prénom" required />
            </label>
            <label>
              Nom
              <input id="registration-last-name" name="last_name" type="text" placeholder="Nom" required />
            </label>
            <label>
              Adresse e-mail
              <input id="registration-email" name="email" type="email" placeholder="vous@exemple.fr" required />
            </label>
            <label>
              Login 42
              <input id="registration-login-42" name="login_42" type="text" placeholder="login42" />
            </label>
            <button class="button button-primary" id="registration-submit-button" type="submit">
              Envoyer la demande
            </button>
          </form>

          <div class="empty-state is-hidden" id="registration-state-box"></div>

          <div class="success-box is-hidden" id="registration-success">
            <div>
              <strong>Votre demande a été enregistrée.</strong>
              <p>
              Votre inscription a bien été transmise. Les places affichées ont été mises à jour.
              </p>
            </div>
          </div>
        </div>

        <aside class="registration-summary">
          <article class="info-card animate-rise" id="registration-session-summary">
            <span class="category-badge">Session sélectionnée</span>
            <h3>Chargement de la session</h3>
            <p>Les sessions disponibles sont en cours de récupération.</p>
          </article>
          <article class="info-card animate-rise">
            <span class="subtle-badge">Évolution future</span>
            <p>
              Cette vue peut accueillir plus tard la gestion des places, une validation admin,
              un paiement ou un historique d’inscription.
            </p>
          </article>
        </aside>
      </section>
    </div>
  `;
}

function renderEventsPage() {
  return `
    <div class="page-flow">
      <section class="page-hero animate-rise">
        ${sectionHeading(
          "Agenda",
          "Événements du fablab",
          "Le site valorise la vie du lieu avec des rendez-vous lisibles, chaleureux et faciles à consulter.",
        )}
      </section>

      <section class="card-grid two-columns" id="events-grid">
        ${renderEventsLoadingState()}
      </section>
    </div>
  `;
}

function renderSignupPage() {
  const loginHref = `${routeMap.login}${window.location.search || ""}`;

  return `
    <div class="page-flow">
      <section class="registration-layout">
        <div class="section-card registration-card animate-rise">
          ${sectionHeading(
            "Compte",
            "Créer un espace personnel",
            "Inscrivez-vous pour suivre vos sessions, retrouver vos modules passés et gérer vos inscriptions depuis un espace dédié.",
          )}

          <form class="signup-form" id="user-signup-form">
            <label for="signup-display-name">
              Nom affiché
              <input id="signup-display-name" name="display_name" type="text" required />
            </label>
            <label for="signup-login-42">
              Login 42
              <input id="signup-login-42" name="login_42" type="text" />
            </label>
            <label for="signup-email">
              Adresse e-mail
              <input id="signup-email" name="email" type="email" autocomplete="email" required />
            </label>
            <label for="signup-password">
              Mot de passe
              <input
                id="signup-password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
              />
            </label>
            <label for="signup-password-confirmation">
              Confirmer le mot de passe
              <input
                id="signup-password-confirmation"
                name="password_confirmation"
                type="password"
                autocomplete="new-password"
                required
              />
            </label>
            <button class="button button-primary" id="user-signup-submit" type="submit">
              Créer mon compte
            </button>
            <p id="user-signup-message" class="admin-login-message" aria-live="polite">
              Votre compte utilisateur vous donnera accès à vos inscriptions et à votre espace personnel.
            </p>
          </form>
        </div>

        <aside class="registration-summary">
          <article class="info-card animate-rise">
            <span class="category-badge">Déjà inscrit</span>
            <h3>Vous avez déjà un compte ?</h3>
            <p>
              Connectez-vous pour retrouver vos sessions futures, vos modules passés et votre tableau
              de bord personnel.
            </p>
            <a class="button button-ghost" href="${loginHref}">Se connecter</a>
          </article>
          <article class="info-card animate-rise">
            <span class="subtle-badge">Parcours utilisateur</span>
            <p>
              Le compte sert à sécuriser les inscriptions, éviter les doublons et vous permettre de
              suivre votre progression proprement.
            </p>
          </article>
        </aside>
      </section>
    </div>
  `;
}

function renderLoginPage() {
  const signupHref = `${routeMap.signup}${window.location.search || ""}`;

  return `
    <div class="page-flow">
      <section class="registration-layout">
        <div class="section-card registration-card animate-rise">
          ${sectionHeading(
            "Compte",
            "Connexion utilisateur",
            "Connectez-vous pour réserver une session, consulter vos inscriptions et accéder à votre espace personnel.",
          )}

          <form class="signup-form" id="user-login-form">
            <label for="user-login-email">
              Adresse e-mail
              <input id="user-login-email" name="email" type="email" autocomplete="email" required />
            </label>
            <label for="user-login-password">
              Mot de passe
              <input
                id="user-login-password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
              />
            </label>
            <button class="button button-primary" id="user-login-submit" type="submit">
              Se connecter
            </button>
            <p id="user-login-message" class="admin-login-message" aria-live="polite">
              Utilisez les identifiants de votre espace utilisateur.
            </p>
          </form>
        </div>

        <aside class="registration-summary">
          <article class="info-card animate-rise">
            <span class="category-badge">Nouveau ici</span>
            <h3>Créer un compte</h3>
            <p>
              Un compte vous permet de suivre vos sessions, d’éviter les doublons et de retrouver vos
              prochaines dates en un coup d’œil.
            </p>
            <a class="button button-ghost" href="${signupHref}">Créer un compte</a>
          </article>
          <article class="info-card animate-rise">
            <span class="subtle-badge">Inscription aux sessions</span>
            <p>
              Si vous venez depuis une session précise, votre redirection sera conservée après
              connexion pour ne pas casser le parcours.
            </p>
          </article>
        </aside>
      </section>
    </div>
  `;
}

function renderUserDashboardLoadingPage() {
  return `
    <section class="section-card animate-rise">
      ${sectionHeading(
        "Mon espace",
        "Chargement de votre espace",
        "Vérification de la session utilisateur et récupération de vos données personnelles.",
      )}
    </section>
  `;
}

function renderUserDashboardErrorPage(text = "Votre espace n’a pas pu être chargé pour le moment.") {
  return `
    <section class="section-card animate-rise">
      ${sectionHeading("Mon espace", "Chargement impossible", text)}
      <div class="section-action">
        <a class="button button-primary" href="${routeMap.login}">Retour à la connexion</a>
      </div>
    </section>
  `;
}

function renderUserDashboardPage(summary) {
  const displayName = summary.displayName || summary.email || "Utilisateur";

  return `
    <div class="page-flow">
      <section class="page-hero animate-rise">
        ${sectionHeading(
          "Mon espace",
          `Bienvenue ${displayName}`,
          "Retrouvez ici vos prochaines sessions, vos modules passés et les actions utiles liées à votre parcours au fablab.",
        )}
      </section>

      <section class="user-hero-grid animate-rise">
        <article class="info-card user-profile-card">
          <span class="category-badge">Profil connecté</span>
          <h3>${displayName}</h3>
          <div class="user-profile-meta">
            <span class="subtle-badge">${summary.email || "Email non disponible"}</span>
            ${
              summary.login42
                ? `<span class="subtle-badge">Login 42 : ${summary.login42}</span>`
                : ""
            }
          </div>
          <p>
            Cet espace réunit vos inscriptions, votre historique pédagogique et des raccourcis pour
            préparer vos prochaines sessions.
          </p>
        </article>

        <article class="info-card user-actions-card">
          <span class="subtle-badge">Actions rapides</span>
          <div class="metrics-grid user-metrics-grid">
            <article class="metric-card">
              <strong>${summary.upcomingRegistrationsCount}</strong>
              <span>inscriptions à venir</span>
            </article>
            <article class="metric-card">
              <strong>${summary.completedModulesCount}</strong>
              <span>modules passés</span>
            </article>
          </div>
          <div class="user-actions-row">
            <a class="button button-secondary" href="${routeMap.sessions}">Voir les sessions</a>
            <button class="button button-ghost" id="user-logout-button" type="button">
              Se déconnecter
            </button>
          </div>
          <p id="user-dashboard-message" class="admin-feedback" aria-live="polite"></p>
        </article>
      </section>

      <section class="section-card animate-rise">
        ${sectionHeading(
          "À venir",
          "Mes sessions à venir",
          "Vos prochaines sessions réservent une place, avec un accès rapide à votre agenda et à l’annulation si nécessaire.",
        )}
        <div class="card-grid two-columns" id="user-upcoming-registrations">
          ${renderEventsLoadingState("Chargement", "Récupération de vos prochaines inscriptions...")}
        </div>
      </section>

      <section class="section-card section-card-soft animate-rise">
        ${sectionHeading(
          "Parcours",
          "Mes modules passés",
          "Une lecture simple de ce que vous avez déjà suivi, pour voir d’où vous repartez.",
        )}
        <div class="card-grid two-columns" id="user-completed-modules">
          ${renderEventsLoadingState("Chargement", "Récupération de vos modules passés...")}
        </div>
      </section>

      <section class="section-card animate-rise is-hidden" id="user-cancelled-section">
        ${sectionHeading(
          "Archive",
          "Mes inscriptions annulées",
          "Un historique léger des réservations annulées, utile si vous devez replanifier plus tard.",
        )}
        <div class="card-grid two-columns" id="user-cancelled-registrations"></div>
      </section>
    </div>
  `;
}

function renderAdminPage(userEmail = "") {
  return `
    <div class="page-flow">
      <section class="page-hero animate-rise">
        ${sectionHeading(
          "Admin",
          "Interface d’administration du fablab",
          "Une base utile pour gérer le matériel, les besoins, les événements, les sessions et les inscriptions depuis Supabase.",
        )}
        <div class="section-action">
          <span class="subtle-badge admin-user-badge">${userEmail}</span>
        </div>
      </section>

      <section class="admin-session-panel animate-rise">
        <div class="admin-session-copy">
          <span class="category-badge">Session admin active</span>
          <h3>${userEmail}</h3>
          <p>
            Ce compte est actuellement connecté à l’interface d’administration du fablab.
          </p>
        </div>
        <div class="admin-session-actions">
          <button class="button button-ghost" id="admin-logout-button" type="button">
            Se déconnecter
          </button>
          <p id="admin-logout-message" class="admin-logout-message" aria-live="polite"></p>
        </div>
      </section>

      <section class="metrics-grid">
        <article class="metric-card animate-rise">
          <strong id="admin-inventory-metric">Chargement de l’inventaire</strong>
          <span>Le stock utile du fablab, prêt à être mis à jour.</span>
        </article>
        <article class="metric-card animate-rise">
          <strong id="admin-needs-metric">Chargement des besoins</strong>
          <span>Le matériel à commander ou documenter pour la suite.</span>
        </article>
        <article class="metric-card animate-rise">
          <strong id="admin-events-metric">Chargement des événements</strong>
          <span>Les rendez-vous visibles côté public et leur pilotage éditorial.</span>
        </article>
        <article class="metric-card animate-rise">
          <strong id="admin-registrations-metric">Chargement des inscriptions</strong>
          <span>Le suivi des demandes et des statuts de participation.</span>
        </article>
      </section>

      ${renderAdminCrudSection({
        sectionId: "inventory",
        eyebrow: "Inventaire",
        title: "Matériel disponible",
        text: "Gérez les références, quantités et emplacements du matériel réellement disponible dans le fablab.",
        formTitle: "Ajouter un item",
        listTitle: "Inventaire actuel",
        loadingText: "Chargement de l’inventaire...",
        formMarkup: renderInventoryAdminForm(),
      })}

      ${renderAdminCrudSection({
        sectionId: "needed-equipment",
        eyebrow: "Besoins",
        title: "Matériel nécessaire",
        text: "Suivez les achats à lancer, les besoins prioritaires et les notes utiles à la coordination.",
        formTitle: "Ajouter un besoin",
        listTitle: "Besoins suivis",
        loadingText: "Chargement des besoins matériels...",
        formMarkup: renderNeededEquipmentAdminForm(),
        sectionClassName: "section-card-soft",
      })}

      ${renderAdminCrudSection({
        sectionId: "events-admin",
        eyebrow: "Agenda",
        title: "Événements publiés",
        text: "Publiez, ajustez ou retirez les événements visibles sur le site public.",
        formTitle: "Ajouter un événement",
        listTitle: "Événements en base",
        loadingText: "Chargement des événements...",
        formMarkup: renderEventsAdminForm(),
      })}

      ${renderAdminCrudSection({
        sectionId: "sessions-admin",
        eyebrow: "Sessions",
        title: "Sessions de cours",
        text: "Créez les sessions, reliez-les aux modules et gardez une lecture claire des places disponibles.",
        formTitle: "Ajouter une session",
        listTitle: "Sessions programmées",
        loadingText: "Chargement des sessions...",
        formMarkup: renderSessionsAdminForm(),
        sectionClassName: "section-card-soft",
      })}

      ${renderAdminListSection({
        sectionId: "registrations-admin",
        eyebrow: "Inscriptions",
        title: "Demandes reçues",
        text: "Consultez les inscriptions, mettez à jour leur statut et supprimez les entrées inutiles.",
        listTitle: "Inscriptions en base",
        loadingText: "Chargement des inscriptions...",
      })}
    </div>
  `;
}

function renderAdminCrudSection({
  sectionId,
  eyebrow,
  title,
  text,
  formTitle,
  listTitle,
  loadingText,
  formMarkup,
  sectionClassName = "",
}) {
  return `
    <section class="section-card ${sectionClassName} animate-rise">
      ${sectionHeading(eyebrow, title, text)}
      <div class="admin-section-grid">
        <article class="admin-panel admin-panel-form">
          <div class="admin-panel-head">
            <h3 id="${sectionId}-form-title">${formTitle}</h3>
          </div>
          ${formMarkup}
          <p id="${sectionId}-form-message" class="admin-feedback" aria-live="polite"></p>
        </article>

        <article class="admin-panel admin-panel-list">
          <div class="admin-panel-head">
            <h3>${listTitle}</h3>
            <span class="subtle-badge" id="${sectionId}-count">Chargement...</span>
          </div>
          <div id="${sectionId}-list">${renderAdminListLoadingState(loadingText)}</div>
        </article>
      </div>
    </section>
  `;
}

function renderAdminListSection({
  sectionId,
  eyebrow,
  title,
  text,
  listTitle,
  loadingText,
}) {
  return `
    <section class="section-card animate-rise">
      ${sectionHeading(eyebrow, title, text)}
      <article class="admin-panel admin-panel-list admin-panel-full">
        <div class="admin-panel-head">
          <h3>${listTitle}</h3>
          <span class="subtle-badge" id="${sectionId}-count">Chargement...</span>
        </div>
        <p id="${sectionId}-message" class="admin-feedback" aria-live="polite"></p>
        <div id="${sectionId}-list">${renderAdminListLoadingState(loadingText)}</div>
      </article>
    </section>
  `;
}

function renderInventoryAdminForm() {
  return `
    <form class="signup-form admin-form" id="inventory-form">
      <input id="inventory-id" name="id" type="hidden" />
      <div class="admin-field-grid">
        <label for="inventory-item-name">
          Nom du matériel
          <input id="inventory-item-name" name="item_name" type="text" required />
        </label>
        <label for="inventory-internal-id">
          Référence interne
          <input id="inventory-internal-id" name="internal_id" type="text" />
        </label>
      </div>
      <div class="admin-field-grid">
        <label for="inventory-category">
          Catégorie
          <input id="inventory-category" name="category" type="text" />
        </label>
        <label for="inventory-quantity">
          Quantité
          <input id="inventory-quantity" name="quantity" type="number" min="0" step="1" required />
        </label>
      </div>
      <div class="admin-field-grid">
        <label for="inventory-condition">
          État
          <input id="inventory-condition" name="condition" type="text" />
        </label>
        <label for="inventory-location">
          Emplacement
          <input id="inventory-location" name="location" type="text" />
        </label>
      </div>
      <div class="admin-form-actions">
        <button class="button button-primary" id="inventory-submit" type="submit">
          Ajouter à l’inventaire
        </button>
        <button class="button button-ghost is-hidden" id="inventory-cancel-edit" type="button">
          Annuler
        </button>
      </div>
    </form>
  `;
}

function renderNeededEquipmentAdminForm() {
  return `
    <form class="signup-form admin-form" id="needed-equipment-form">
      <input id="needed-equipment-id" name="id" type="hidden" />
      <div class="admin-field-grid">
        <label for="needed-equipment-item-name">
          Matériel souhaité
          <input id="needed-equipment-item-name" name="item_name" type="text" required />
        </label>
        <label for="needed-equipment-category">
          Catégorie
          <input id="needed-equipment-category" name="category" type="text" />
        </label>
      </div>
      <div class="admin-field-grid">
        <label for="needed-equipment-quantity">
          Quantité voulue
          <input
            id="needed-equipment-quantity"
            name="quantity_needed"
            type="number"
            min="0"
            step="1"
            required
          />
        </label>
        <label for="needed-equipment-priority">
          Priorité
          <input id="needed-equipment-priority" name="priority" type="text" />
        </label>
      </div>
      <label for="needed-equipment-status">
        Statut
        <input id="needed-equipment-status" name="status" type="text" />
      </label>
      <label for="needed-equipment-note">
        Note
        <textarea id="needed-equipment-note" name="note" rows="4"></textarea>
      </label>
      <div class="admin-form-actions">
        <button class="button button-primary" id="needed-equipment-submit" type="submit">
          Ajouter au suivi
        </button>
        <button
          class="button button-ghost is-hidden"
          id="needed-equipment-cancel-edit"
          type="button"
        >
          Annuler
        </button>
      </div>
    </form>
  `;
}

function renderEventsAdminForm() {
  return `
    <form class="signup-form admin-form" id="events-admin-form">
      <input id="events-admin-id" name="id" type="hidden" />
      <label for="events-admin-title">
        Titre
        <input id="events-admin-title" name="title" type="text" required />
      </label>
      <label for="events-admin-short-description">
        Résumé court
        <textarea
          id="events-admin-short-description"
          name="short_description"
          rows="3"
          required
        ></textarea>
      </label>
      <label for="events-admin-description">
        Description complète
        <textarea id="events-admin-description" name="description" rows="5"></textarea>
      </label>
      <div class="admin-field-grid">
        <label for="events-admin-date">
          Date
          <input id="events-admin-date" name="event_date" type="date" required />
        </label>
        <label for="events-admin-location">
          Lieu
          <input id="events-admin-location" name="location" type="text" />
        </label>
      </div>
      <div class="admin-field-grid">
        <label for="events-admin-start-time">
          Heure de début
          <input id="events-admin-start-time" name="start_time" type="time" />
        </label>
        <label for="events-admin-end-time">
          Heure de fin
          <input id="events-admin-end-time" name="end_time" type="time" />
        </label>
      </div>
      <label for="events-admin-image-url">
        Image URL
        <input id="events-admin-image-url" name="image_url" type="url" />
      </label>
      <div class="admin-form-actions">
        <button class="button button-primary" id="events-admin-submit" type="submit">
          Publier l’événement
        </button>
        <button class="button button-ghost is-hidden" id="events-admin-cancel-edit" type="button">
          Annuler
        </button>
      </div>
    </form>
  `;
}

function renderSessionsAdminForm() {
  return `
    <form class="signup-form admin-form" id="sessions-admin-form">
      <input id="sessions-admin-id" name="id" type="hidden" />
      <label for="sessions-admin-title">
        Titre de session
        <input id="sessions-admin-title" name="title" type="text" required />
      </label>
      <div class="admin-field-grid">
        <label for="sessions-admin-date">
          Date
          <input id="sessions-admin-date" name="session_date" type="date" required />
        </label>
        <label for="sessions-admin-level">
          Niveau
          <input id="sessions-admin-level" name="level" type="text" placeholder="Débutant" />
        </label>
      </div>
      <div class="admin-field-grid">
        <label for="sessions-admin-start-time">
          Heure de début
          <input id="sessions-admin-start-time" name="start_time" type="time" />
        </label>
        <label for="sessions-admin-end-time">
          Heure de fin
          <input id="sessions-admin-end-time" name="end_time" type="time" />
        </label>
      </div>
      <div class="admin-field-grid">
        <label for="sessions-admin-seats-total">
          Places totales
          <input id="sessions-admin-seats-total" name="seats_total" type="number" min="0" step="1" />
        </label>
      </div>
      <fieldset class="admin-module-fieldset">
        <legend>Modules liés</legend>
        <div id="sessions-admin-module-options" class="admin-checkbox-grid">
          <p class="admin-helper-text">Chargement des modules...</p>
        </div>
      </fieldset>
      <label for="sessions-admin-notes">
        Notes
        <textarea id="sessions-admin-notes" name="notes" rows="4"></textarea>
      </label>
      <div class="admin-form-actions">
        <button class="button button-primary" id="sessions-admin-submit" type="submit">
          Créer la session
        </button>
        <button
          class="button button-ghost is-hidden"
          id="sessions-admin-cancel-edit"
          type="button"
        >
          Annuler
        </button>
      </div>
    </form>
  `;
}

function renderAdminListLoadingState(text) {
  return `
    <div class="empty-state admin-empty-state">
      <span class="subtle-badge">Chargement</span>
      <p>${text}</p>
    </div>
  `;
}

function renderAdminLoadingPage() {
  return `
    <section class="section-card animate-rise">
      ${sectionHeading(
        "Admin",
        "Vérification de la session",
        "Contrôle en cours avant l’affichage de l’interface d’administration.",
      )}
    </section>
  `;
}

function renderAdminErrorPage() {
  return `
    <section class="section-card animate-rise">
      ${sectionHeading(
        "Admin",
        "Impossible de vérifier la session",
        "La session administrateur n’a pas pu être vérifiée pour le moment.",
      )}
      <div class="section-action">
        <a class="button button-primary" href="${routeMap.adminLogin}">Retour à la connexion</a>
      </div>
    </section>
  `;
}

function renderAdminAccessDeniedPage() {
  return `
    <section class="section-card animate-rise">
      ${sectionHeading(
        "Admin",
        "Accès refusé",
        "Votre session est bien active, mais ce compte ne dispose pas des droits nécessaires pour accéder à l’administration.",
      )}
      <div class="section-action">
        <a class="button button-primary" href="${routeMap.account}">Aller vers mon espace</a>
        <a class="button button-ghost" href="${routeMap.home}">Retour à l’accueil</a>
      </div>
    </section>
  `;
}

function renderAdminLoginPage() {
  return `
    <div class="page-flow">
      <section class="registration-layout">
        <div class="section-card registration-card animate-rise">
          ${sectionHeading(
            "Admin",
            "Connexion admin",
            "Accès réservé à l’administration du fablab. Le branchement d’authentification sera ajouté ensuite.",
          )}

          <form class="signup-form" id="admin-login-form">
            <label for="admin-email">
              Email
              <input id="admin-email" name="email" type="email" autocomplete="email" required />
            </label>
            <label for="admin-password">
              Mot de passe
              <input
                id="admin-password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
              />
            </label>
            <button class="button button-primary" id="admin-login-submit" type="submit">
              Se connecter
            </button>
            <p id="admin-login-message" class="admin-login-message">
              Utilisez vos identifiants administrateur.
            </p>
          </form>
        </div>

        <aside class="registration-summary">
          <article class="info-card animate-rise">
            <span class="category-badge">Accès interne</span>
            <h3>Zone d’administration</h3>
            <p>
              Cette page prépare l’accès aux outils internes du fablab, avec un point d’entrée
              propre pour l’authentification Supabase.
            </p>
          </article>
          <article class="info-card animate-rise">
            <span class="subtle-badge">Étape suivante</span>
            <p>
              La prochaine étape logique sera le branchement de
              <code>signInWithPassword</code> et la redirection vers la zone admin protégée.
            </p>
          </article>
        </aside>
      </section>
    </div>
  `;
}

function renderNotFound() {
  document.title = "Page introuvable • Fablab 42 Marseille";
  return renderEmptyPage(
    "404",
    "Cette page n’existe pas",
    "Le contenu demandé n’est pas disponible à cette adresse.",
    routeMap.home,
    "Retour à l’accueil",
  );
}

function renderModuleCard(module) {
  return `
    <a class="info-card module-card animate-rise" href="${moduleLink(module.id)}">
      <div class="card-topline">
        <span class="eyebrow eyebrow-tight">Module</span>
        <span>↗</span>
      </div>
      <h3>${module.title}</h3>
      <p>${module.shortText}</p>
      <div class="tag-row">
        ${module.focus.map((item) => `<span class="tag">${item}</span>`).join("")}
      </div>
      <p class="muted-text">${module.presentation}</p>
    </a>
  `;
}

function renderEventCard(event) {
  const normalizedEvent = normalizeEvent(event);

  return `
    <article class="info-card event-card animate-rise">
      <div class="event-card-head">
        <span class="event-date-badge">${formatDate(normalizedEvent.date)}</span>
        <span class="category-badge">${normalizedEvent.category}</span>
      </div>
      <h3>${normalizedEvent.title}</h3>
      <p>${normalizedEvent.description}</p>
      ${
        normalizedEvent.meta.length
          ? `<div class="event-meta">${normalizedEvent.meta
              .map((item) => `<span class="subtle-badge">${item}</span>`)
              .join("")}</div>`
          : ""
      }
    </article>
  `;
}

function normalizeEvent(event) {
  const startTime = event.start_time ?? event.startTime ?? null;
  const endTime = event.end_time ?? event.endTime ?? null;
  const location = event.location ?? null;

  const meta = [];
  const timeRange = formatTimeRange(startTime, endTime);

  if (timeRange) {
    meta.push(timeRange);
  }

  if (location) {
    meta.push(location);
  }

  return {
    title: event.title,
    category: event.category ?? "Événement",
    date: event.date ?? event.event_date,
    description: event.short_description ?? event.description ?? "",
    meta,
  };
}

function renderSessionCard(session) {
  const normalizedSession = normalizeSession(session);

  return `
    <article class="info-card session-card animate-rise">
      <div class="session-head">
        <span class="category-badge">${formatDate(normalizedSession.date)}</span>
        <span class="subtle-badge">${normalizedSession.level}</span>
      </div>
      <h3>${normalizedSession.title}</h3>
      <div class="session-meta">
        ${
          normalizedSession.timeRange
            ? `<div class="inline-detail">${normalizedSession.timeRange}</div>`
            : ""
        }
        ${
          normalizedSession.seatLabel
            ? `<div class="inline-detail">${normalizedSession.seatLabel}</div>`
            : ""
        }
      </div>
      ${
        normalizedSession.modules.length
          ? `<div class="session-modules">${normalizedSession.modules
              .map((item) => `<span class="tag">${item}</span>`)
              .join("")}</div>`
          : ""
      }
      ${
        normalizedSession.notes
          ? `<p class="session-notes">${normalizedSession.notes}</p>`
          : ""
      }
      <div class="session-cta">
        <a class="button button-primary button-block" href="${registrationLink(normalizedSession.id)}">
          S’inscrire
        </a>
        <span class="session-availability">Formulaire d’inscription prêt</span>
      </div>
    </article>
  `;
}

function normalizeSession(session) {
  const startTime = session.start_time ?? session.startTime ?? null;
  const endTime = session.end_time ?? session.endTime ?? null;
  const seatsRemaining = normalizeOptionalNumber(
    session.seats_remaining ?? session.remaining_seats,
  );
  const seatsTotal = normalizeOptionalNumber(
    session.seats_total ?? session.total_seats,
  );
  const modulesList = normalizeModulesList(
    session.modules ??
      session.module_titles ??
      session.modules_included ??
      session.included_modules ??
      session.module_list ??
      session.module_names,
  );

  let seatLabel = "";
  if (seatsRemaining !== null && seatsTotal !== null) {
    seatLabel = `${seatsRemaining} / ${seatsTotal} places restantes`;
  } else if (seatsTotal !== null) {
    seatLabel = `${seatsTotal} places`;
  }

  return {
    id:
      session.id ??
      session.session_id ??
      `${session.title ?? "session"}-${session.session_date ?? session.date ?? "na"}`,
    title: session.title ?? "Session",
    date: session.session_date ?? session.date,
    timeRange: formatTimeRange(startTime, endTime),
    level: session.level ?? "Tous niveaux",
    seatsRemaining,
    seatsTotal,
    seatLabel,
    modules: modulesList,
    notes: session.notes ?? "",
  };
}

function normalizeOptionalNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function normalizeModulesList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) {
          return null;
        }

        if (typeof item === "object") {
          return item.title ?? item.name ?? null;
        }

        return String(item);
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.startsWith("[")) {
      try {
        return normalizeModulesList(JSON.parse(trimmed));
      } catch {
        return trimmed
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((item) => item.replace(/^"|"$/g, "").trim())
          .filter(Boolean);
      }
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function renderTable(headers, rows) {
  return `
    <div class="table-card">
      <table>
        <thead>
          <tr>${headers.map((headerItem) => `<th>${headerItem}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderEmptyPage(eyebrow, title, text, href, label) {
  return `
    <section class="section-card animate-rise">
      ${sectionHeading(eyebrow, title, text)}
      <a class="button button-primary" href="${href}">${label}</a>
    </section>
  `;
}

function sectionHeading(eyebrow, title, text) {
  return `
    <div class="section-heading">
      <span class="eyebrow">${eyebrow}</span>
      <h2>${title}</h2>
      <p>${text}</p>
    </div>
  `;
}

function miniDetailCard(title, text) {
  return `
    <article class="mini-detail-card">
      <div>
        <strong>${title}</strong>
        <p>${text}</p>
      </div>
    </article>
  `;
}

function cacheAdminDom() {
  adminDom = {
    inventory: {
      form: document.getElementById("inventory-form"),
      formTitle: document.getElementById("inventory-form-title"),
      formMessage: document.getElementById("inventory-form-message"),
      list: document.getElementById("inventory-list"),
      count: document.getElementById("inventory-count"),
      id: document.getElementById("inventory-id"),
      itemName: document.getElementById("inventory-item-name"),
      internalId: document.getElementById("inventory-internal-id"),
      category: document.getElementById("inventory-category"),
      quantity: document.getElementById("inventory-quantity"),
      condition: document.getElementById("inventory-condition"),
      location: document.getElementById("inventory-location"),
      submit: document.getElementById("inventory-submit"),
      cancel: document.getElementById("inventory-cancel-edit"),
    },
    neededEquipment: {
      form: document.getElementById("needed-equipment-form"),
      formTitle: document.getElementById("needed-equipment-form-title"),
      formMessage: document.getElementById("needed-equipment-form-message"),
      list: document.getElementById("needed-equipment-list"),
      count: document.getElementById("needed-equipment-count"),
      id: document.getElementById("needed-equipment-id"),
      itemName: document.getElementById("needed-equipment-item-name"),
      category: document.getElementById("needed-equipment-category"),
      quantity: document.getElementById("needed-equipment-quantity"),
      priority: document.getElementById("needed-equipment-priority"),
      status: document.getElementById("needed-equipment-status"),
      note: document.getElementById("needed-equipment-note"),
      submit: document.getElementById("needed-equipment-submit"),
      cancel: document.getElementById("needed-equipment-cancel-edit"),
    },
    events: {
      form: document.getElementById("events-admin-form"),
      formTitle: document.getElementById("events-admin-form-title"),
      formMessage: document.getElementById("events-admin-form-message"),
      list: document.getElementById("events-admin-list"),
      count: document.getElementById("events-admin-count"),
      id: document.getElementById("events-admin-id"),
      title: document.getElementById("events-admin-title"),
      shortDescription: document.getElementById("events-admin-short-description"),
      description: document.getElementById("events-admin-description"),
      date: document.getElementById("events-admin-date"),
      startTime: document.getElementById("events-admin-start-time"),
      endTime: document.getElementById("events-admin-end-time"),
      location: document.getElementById("events-admin-location"),
      imageUrl: document.getElementById("events-admin-image-url"),
      submit: document.getElementById("events-admin-submit"),
      cancel: document.getElementById("events-admin-cancel-edit"),
    },
    sessions: {
      form: document.getElementById("sessions-admin-form"),
      formTitle: document.getElementById("sessions-admin-form-title"),
      formMessage: document.getElementById("sessions-admin-form-message"),
      list: document.getElementById("sessions-admin-list"),
      count: document.getElementById("sessions-admin-count"),
      id: document.getElementById("sessions-admin-id"),
      title: document.getElementById("sessions-admin-title"),
      date: document.getElementById("sessions-admin-date"),
      startTime: document.getElementById("sessions-admin-start-time"),
      endTime: document.getElementById("sessions-admin-end-time"),
      level: document.getElementById("sessions-admin-level"),
      seatsTotal: document.getElementById("sessions-admin-seats-total"),
      notes: document.getElementById("sessions-admin-notes"),
      moduleOptions: document.getElementById("sessions-admin-module-options"),
      submit: document.getElementById("sessions-admin-submit"),
      cancel: document.getElementById("sessions-admin-cancel-edit"),
    },
    registrations: {
      list: document.getElementById("registrations-admin-list"),
      count: document.getElementById("registrations-admin-count"),
      message: document.getElementById("registrations-admin-message"),
    },
    metrics: {
      inventory: document.getElementById("admin-inventory-metric"),
      needs: document.getElementById("admin-needs-metric"),
      events: document.getElementById("admin-events-metric"),
      registrations: document.getElementById("admin-registrations-metric"),
    },
  };
}

function bindAdminDashboardInteractions() {
  bindInventoryAdminControls();
  bindNeededEquipmentAdminControls();
  bindEventsAdminControls();
  bindSessionsAdminControls();
  bindRegistrationsAdminControls();
}

async function initializeAdminDashboard() {
  if (!adminDom) {
    return;
  }

  renderAdminMetrics();
  await Promise.all([
    refreshInventorySection(),
    refreshNeededEquipmentSection(),
    refreshEventsAdminSection(),
    refreshModulesAdminCollection(),
    refreshSessionsAdminSection(),
    refreshRegistrationsAdminSection(),
  ]);
}

function bindInventoryAdminControls() {
  const section = adminDom?.inventory;

  if (!section?.form || !section.list) {
    return;
  }

  section.form.addEventListener("submit", handleInventoryFormSubmit);
  section.cancel?.addEventListener("click", () => resetInventoryForm());

  section.list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action][data-id]");
    if (!button) {
      return;
    }

    const recordId = button.dataset.id;

    if (button.dataset.action === "edit") {
      populateInventoryForm(recordId);
      return;
    }

    if (button.dataset.action === "delete") {
      await deleteInventoryRecord(recordId, button);
    }
  });

  updateAdminFormMode("inventory", adminFormLabels.inventory);
}

function bindNeededEquipmentAdminControls() {
  const section = adminDom?.neededEquipment;

  if (!section?.form || !section.list) {
    return;
  }

  section.form.addEventListener("submit", handleNeededEquipmentFormSubmit);
  section.cancel?.addEventListener("click", () => resetNeededEquipmentForm());

  section.list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action][data-id]");
    if (!button) {
      return;
    }

    const recordId = button.dataset.id;

    if (button.dataset.action === "edit") {
      populateNeededEquipmentForm(recordId);
      return;
    }

    if (button.dataset.action === "delete") {
      await deleteNeededEquipmentRecord(recordId, button);
    }
  });

  updateAdminFormMode("needed-equipment", adminFormLabels.neededEquipment);
}

function bindEventsAdminControls() {
  const section = adminDom?.events;

  if (!section?.form || !section.list) {
    return;
  }

  section.form.addEventListener("submit", handleEventAdminFormSubmit);
  section.cancel?.addEventListener("click", () => resetEventsAdminForm());

  section.list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action][data-id]");
    if (!button) {
      return;
    }

    const recordId = button.dataset.id;

    if (button.dataset.action === "edit") {
      populateEventsAdminForm(recordId);
      return;
    }

    if (button.dataset.action === "delete") {
      await deleteEventAdminRecord(recordId, button);
    }
  });

  updateAdminFormMode("events-admin", adminFormLabels.event);
}

function bindSessionsAdminControls() {
  const section = adminDom?.sessions;

  if (!section?.form || !section.list) {
    return;
  }

  section.form.addEventListener("submit", handleSessionsAdminFormSubmit);
  section.cancel?.addEventListener("click", () => resetSessionsAdminForm());

  section.list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action][data-id]");
    if (!button) {
      return;
    }

    const recordId = button.dataset.id;

    if (button.dataset.action === "edit") {
      populateSessionsAdminForm(recordId);
      return;
    }

    if (button.dataset.action === "delete") {
      await deleteSessionsAdminRecord(recordId, button);
    }
  });

  updateAdminFormMode("sessions-admin", adminFormLabels.session);
}

function bindRegistrationsAdminControls() {
  const section = adminDom?.registrations;

  if (!section?.list) {
    return;
  }

  section.list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action][data-id]");
    if (!button) {
      return;
    }

    const recordId = button.dataset.id;

    if (button.dataset.action === "save-status") {
      await updateRegistrationStatus(recordId, button);
      return;
    }

    if (button.dataset.action === "delete") {
      await deleteRegistrationRecord(recordId, button);
    }
  });
}

async function refreshInventorySection() {
  const section = adminDom?.inventory;

  if (!section?.list || !section.count) {
    return;
  }

  section.count.textContent = "Chargement...";
  section.list.innerHTML = renderAdminListLoadingState("Récupération de l’inventaire...");

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("item_name", { ascending: true });

  if (error) {
    adminState.inventory = [];
    section.count.textContent = "Erreur";
    section.list.innerHTML = renderAdminErrorState(
      "Impossible de charger l’inventaire pour le moment.",
    );
    renderAdminMetrics();
    return;
  }

  adminState.inventory = (data ?? []).map(normalizeInventoryRecord);
  section.count.textContent = formatAdminCount(adminState.inventory.length, "item", "items");
  section.list.innerHTML = renderInventoryAdminList(adminState.inventory);
  renderAdminMetrics();
}

async function refreshNeededEquipmentSection() {
  const section = adminDom?.neededEquipment;

  if (!section?.list || !section.count) {
    return;
  }

  section.count.textContent = "Chargement...";
  section.list.innerHTML = renderAdminListLoadingState("Récupération des besoins matériels...");

  const { data, error } = await supabase
    .from("needed_equipment")
    .select("*")
    .order("priority", { ascending: true })
    .order("item_name", { ascending: true });

  if (error) {
    adminState.neededEquipment = [];
    section.count.textContent = "Erreur";
    section.list.innerHTML = renderAdminErrorState(
      "Impossible de charger les besoins matériels pour le moment.",
    );
    renderAdminMetrics();
    return;
  }

  adminState.neededEquipment = (data ?? []).map(normalizeNeededEquipmentRecord);
  section.count.textContent = formatAdminCount(
    adminState.neededEquipment.length,
    "besoin",
    "besoins",
  );
  section.list.innerHTML = renderNeededEquipmentAdminList(adminState.neededEquipment);
  renderAdminMetrics();
}

async function refreshEventsAdminSection() {
  const section = adminDom?.events;

  if (!section?.list || !section.count) {
    return;
  }

  section.count.textContent = "Chargement...";
  section.list.innerHTML = renderAdminListLoadingState("Récupération des événements...");

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    adminState.events = [];
    section.count.textContent = "Erreur";
    section.list.innerHTML = renderAdminErrorState(
      "Impossible de charger les événements pour le moment.",
    );
    renderAdminMetrics();
    return;
  }

  adminState.events = (data ?? []).map(normalizeAdminEventRecord);
  section.count.textContent = formatAdminCount(
    adminState.events.length,
    "événement",
    "événements",
  );
  section.list.innerHTML = renderEventsAdminList(adminState.events);
  renderAdminMetrics();
}

async function refreshModulesAdminCollection(selectedIds = null) {
  const section = adminDom?.sessions;

  if (!section?.moduleOptions) {
    return false;
  }

  const preservedSelection = selectedIds ?? getSelectedSessionModuleIds();
  section.moduleOptions.innerHTML = `<p class="admin-helper-text">Chargement des modules...</p>`;

  const { data, error } = await supabase
    .from("modules")
    .select("id, title")
    .order("title", { ascending: true });

  if (error) {
    adminState.modules = [];
    section.moduleOptions.innerHTML = `
      <p class="admin-helper-text admin-helper-error">
        Impossible de charger les modules disponibles.
      </p>
    `;
    return false;
  }

  adminState.modules = (data ?? []).map(normalizeAdminModuleRecord);
  section.moduleOptions.innerHTML = renderSessionModuleOptions(preservedSelection);
  return true;
}

async function refreshSessionsAdminSection() {
  const section = adminDom?.sessions;

  if (!section?.list || !section.count) {
    return;
  }

  section.count.textContent = "Chargement...";
  section.list.innerHTML = renderAdminListLoadingState("Récupération des sessions...");

  const [sessionsResult, sessionModulesResult] = await Promise.all([
    supabase
      .from("sessions_with_modules")
      .select("*")
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase.from("session_modules").select("session_id, module_id"),
  ]);

  if (sessionsResult.error || sessionModulesResult.error) {
    adminState.sessions = [];
    adminState.sessionModules = [];
    section.count.textContent = "Erreur";
    section.list.innerHTML = renderAdminErrorState(
      sessionsResult.error?.message ||
        sessionModulesResult.error?.message ||
        "Impossible de charger les sessions pour le moment.",
    );
    return;
  }

  adminState.sessionModules = (sessionModulesResult.data ?? []).map(
    normalizeSessionModuleLink,
  );
  adminState.sessions = (sessionsResult.data ?? []).map(normalizeAdminSessionRecord).map(
    attachSessionModuleIds,
  );

  section.count.textContent = formatAdminCount(
    adminState.sessions.length,
    "session",
    "sessions",
  );
  section.list.innerHTML = renderSessionsAdminList(adminState.sessions);
}

async function refreshRegistrationsAdminSection() {
  const section = adminDom?.registrations;

  if (!section?.list || !section.count) {
    return;
  }

  section.count.textContent = "Chargement...";
  section.list.innerHTML = renderAdminListLoadingState("Récupération des inscriptions...");

  const { data, error } = await supabase
    .from("registrations_with_sessions")
    .select("*")
    .order("session_date", { ascending: true });

  if (error) {
    adminState.registrations = [];
    section.count.textContent = "Erreur";
    section.list.innerHTML = renderAdminErrorState(
      "Impossible de charger les inscriptions pour le moment.",
    );
    renderAdminMetrics();
    return;
  }

  adminState.registrations = (data ?? []).map(normalizeAdminRegistrationRecord);
  section.count.textContent = formatAdminCount(
    adminState.registrations.length,
    "inscription",
    "inscriptions",
  );
  section.list.innerHTML = renderRegistrationsAdminList(adminState.registrations);
  renderAdminMetrics();
}

function renderInventoryAdminList(items) {
  if (!items.length) {
    return renderAdminEmptyState("Aucun item d’inventaire n’est enregistré pour le moment.");
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.itemName)}</strong>
            ${
              item.internalId
                ? `<div class="admin-cell-meta">Réf. ${escapeHtml(item.internalId)}</div>`
                : ""
            }
          </td>
          <td>${escapeHtml(item.category || "Non renseignée")}</td>
          <td>${escapeHtml(item.quantity)}</td>
          <td>${escapeHtml(item.condition || "Non renseigné")}</td>
          <td>${escapeHtml(item.location || "Non renseigné")}</td>
          <td>${renderAdminRowActions(item.id)}</td>
        </tr>
      `,
    )
    .join("");

  return renderAdminTable(
    [
      "Nom du matériel",
      "Catégorie",
      "Quantité",
      "État",
      "Emplacement",
      "Actions",
    ],
    rows,
  );
}

function renderNeededEquipmentAdminList(items) {
  if (!items.length) {
    return renderAdminEmptyState("Aucun besoin matériel n’est enregistré pour le moment.");
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.itemName)}</strong>
            ${
              item.note
                ? `<div class="admin-cell-meta">${escapeHtml(item.note)}</div>`
                : ""
            }
          </td>
          <td>${escapeHtml(item.category || "Non renseignée")}</td>
          <td>${escapeHtml(item.quantityNeeded)}</td>
          <td>${escapeHtml(item.priority || "Non définie")}</td>
          <td>${escapeHtml(item.status || "Non défini")}</td>
          <td>${renderAdminRowActions(item.id)}</td>
        </tr>
      `,
    )
    .join("");

  return renderAdminTable(
    [
      "Matériel souhaité",
      "Catégorie",
      "Quantité",
      "Priorité",
      "Statut",
      "Actions",
    ],
    rows,
  );
}

function renderEventsAdminList(items) {
  if (!items.length) {
    return renderAdminEmptyState("Aucun événement n’est publié pour le moment.");
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.title)}</strong>
            ${
              item.shortDescription
                ? `<div class="admin-cell-meta">${escapeHtml(item.shortDescription)}</div>`
                : ""
            }
          </td>
          <td>
            <strong>${escapeHtml(formatSafeDate(item.eventDate))}</strong>
            ${
              item.timeRange
                ? `<div class="admin-cell-meta">${escapeHtml(item.timeRange)}</div>`
                : ""
            }
          </td>
          <td>${escapeHtml(item.location || "Non renseigné")}</td>
          <td>${escapeHtml(item.imageUrl || "Aucune image")}</td>
          <td>${renderAdminRowActions(item.id)}</td>
        </tr>
      `,
    )
    .join("");

  return renderAdminTable(
    ["Titre", "Date", "Lieu", "Image", "Actions"],
    rows,
  );
}

function renderSessionsAdminList(items) {
  if (!items.length) {
    return renderAdminEmptyState("Aucune session de cours n’est enregistrée pour le moment.");
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.title)}</strong>
            ${
              item.notes
                ? `<div class="admin-cell-meta">${escapeHtml(item.notes)}</div>`
                : ""
            }
          </td>
          <td>
            <strong>${escapeHtml(formatSafeDate(item.sessionDate))}</strong>
            ${
              item.timeRange
                ? `<div class="admin-cell-meta">${escapeHtml(item.timeRange)}</div>`
                : ""
            }
          </td>
          <td>${renderAdminTagList(item.modules)}</td>
          <td>${escapeHtml(item.level || "Tous niveaux")}</td>
          <td>
            <strong>${escapeHtml(item.seatsTotal ?? "—")}</strong>
            ${
              item.seatsRemaining !== null
                ? `<div class="admin-cell-meta">${escapeHtml(
                    `${item.seatsRemaining} restantes`,
                  )}</div>`
                : ""
            }
          </td>
          <td>${renderAdminRowActions(item.id)}</td>
        </tr>
      `,
    )
    .join("");

  return renderAdminTable(
    ["Session", "Date", "Modules", "Niveau", "Places", "Actions"],
    rows,
  );
}

function renderRegistrationsAdminList(items) {
  if (!items.length) {
    return renderAdminEmptyState("Aucune inscription n’a encore été reçue.");
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.firstName)} ${escapeHtml(item.lastName)}</strong>
            <div class="admin-cell-meta">${escapeHtml(item.email)}</div>
            ${
              item.login42
                ? `<div class="admin-cell-meta">Login 42 : ${escapeHtml(item.login42)}</div>`
                : ""
            }
          </td>
          <td>
            <strong>${escapeHtml(item.sessionTitle)}</strong>
            <div class="admin-cell-meta">${escapeHtml(formatSafeDate(item.sessionDate))}</div>
          </td>
          <td>${escapeHtml(item.createdLabel)}</td>
          <td>
            <select class="admin-inline-select" id="registration-status-${escapeHtml(item.id)}" data-registration-id="${escapeHtml(item.id)}">
              ${renderRegistrationStatusOptions(item.status)}
            </select>
          </td>
          <td>
            <div class="admin-row-actions">
              <button
                class="button button-ghost button-small"
                data-action="save-status"
                data-id="${escapeHtml(item.id)}"
                type="button"
              >
                Enregistrer
              </button>
              <button
                class="button button-danger button-small"
                data-action="delete"
                data-id="${escapeHtml(item.id)}"
                type="button"
              >
                Supprimer
              </button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");

  return renderAdminTable(
    ["Inscrit", "Session", "Date", "Statut", "Actions"],
    rows,
  );
}

function renderAdminTable(headers, rowsHtml) {
  return `
    <div class="table-card admin-table-card">
      <table>
        <thead>
          <tr>${headers.map((headerItem) => `<th>${headerItem}</th>`).join("")}</tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function renderAdminEmptyState(text) {
  return `
    <div class="empty-state admin-empty-state">
      <span class="subtle-badge">Vide</span>
      <p>${text}</p>
    </div>
  `;
}

function renderAdminErrorState(text) {
  return `
    <div class="empty-state admin-empty-state">
      <span class="subtle-badge">Erreur</span>
      <p>${text}</p>
    </div>
  `;
}

function renderAdminRowActions(recordId) {
  return `
    <div class="admin-row-actions">
      <button
        class="button button-ghost button-small"
        data-action="edit"
        data-id="${escapeHtml(recordId)}"
        type="button"
      >
        Modifier
      </button>
      <button
        class="button button-danger button-small"
        data-action="delete"
        data-id="${escapeHtml(recordId)}"
        type="button"
      >
        Supprimer
      </button>
    </div>
  `;
}

function renderAdminTagList(items) {
  if (!items.length) {
    return `<span class="admin-cell-meta">Aucun module lié</span>`;
  }

  return `
    <div class="admin-badge-list">
      ${items.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}

function renderSessionModuleOptions(selectedIds = []) {
  if (!adminState.modules.length) {
    return `<p class="admin-helper-text">Aucun module disponible pour le moment.</p>`;
  }

  const normalizedSelection = selectedIds.map(String);

  return adminState.modules
    .map(
      (moduleItem) => `
        <label class="admin-checkbox-option">
          <input
            type="checkbox"
            name="module_ids"
            value="${escapeHtml(moduleItem.id)}"
            ${normalizedSelection.includes(String(moduleItem.id)) ? "checked" : ""}
          />
          <span>${escapeHtml(moduleItem.title)}</span>
        </label>
      `,
    )
    .join("");
}

function renderRegistrationStatusOptions(currentStatus) {
  const statuses = registrationStatusOptions.includes(currentStatus)
    ? registrationStatusOptions
    : [...registrationStatusOptions, currentStatus].filter(Boolean);

  return statuses
    .map(
      (status) => `
        <option value="${escapeHtml(status)}" ${status === currentStatus ? "selected" : ""}>
          ${escapeHtml(status)}
        </option>
      `,
    )
    .join("");
}

function renderAdminMetrics() {
  if (!adminDom?.metrics) {
    return;
  }

  if (adminDom.metrics.inventory) {
    adminDom.metrics.inventory.textContent = formatAdminCount(
      adminState.inventory.length,
      "ligne d’inventaire",
      "lignes d’inventaire",
    );
  }

  if (adminDom.metrics.needs) {
    adminDom.metrics.needs.textContent = formatAdminCount(
      adminState.neededEquipment.length,
      "besoin matériel",
      "besoins matériels",
    );
  }

  if (adminDom.metrics.events) {
    adminDom.metrics.events.textContent = formatAdminCount(
      adminState.events.length,
      "événement publié",
      "événements publiés",
    );
  }

  if (adminDom.metrics.registrations) {
    adminDom.metrics.registrations.textContent = formatAdminCount(
      adminState.registrations.length,
      "inscription",
      "inscriptions",
    );
  }
}

async function handleInventoryFormSubmit(event) {
  event.preventDefault();

  const section = adminDom?.inventory;
  if (!section?.form || !section.submit) {
    return;
  }

  const payload = {
    item_name: section.itemName?.value.trim() ?? "",
    internal_id: normalizeOptionalString(section.internalId?.value),
    category: normalizeOptionalString(section.category?.value),
    quantity: Number(section.quantity?.value ?? 0),
    condition: normalizeOptionalString(section.condition?.value),
    location: normalizeOptionalString(section.location?.value),
  };

  if (!payload.item_name || !Number.isFinite(payload.quantity)) {
    setAdminMessage(section.formMessage, "error", "Complétez au minimum le nom et la quantité.");
    return;
  }

  const isEditing = Boolean(section.id?.value);
  section.submit.disabled = true;

  const query = isEditing
    ? supabase.from("inventory").update(payload).eq("id", section.id.value)
    : supabase.from("inventory").insert([payload]);
  const { error } = await query;

  if (error) {
    setAdminMessage(
      section.formMessage,
      "error",
      error.message || "Impossible d’enregistrer cet item.",
    );
    section.submit.disabled = false;
    return;
  }

  resetInventoryForm({ keepMessage: true });
  setAdminMessage(
    section.formMessage,
    "success",
    isEditing ? "Item mis à jour." : "Item ajouté à l’inventaire.",
  );
  section.submit.disabled = false;
  await refreshInventorySection();
}

async function handleNeededEquipmentFormSubmit(event) {
  event.preventDefault();

  const section = adminDom?.neededEquipment;
  if (!section?.form || !section.submit) {
    return;
  }

  const payload = {
    item_name: section.itemName?.value.trim() ?? "",
    category: normalizeOptionalString(section.category?.value),
    quantity_needed: Number(section.quantity?.value ?? 0),
    priority: normalizeOptionalString(section.priority?.value),
    status: normalizeOptionalString(section.status?.value),
    note: normalizeOptionalString(section.note?.value),
  };

  if (!payload.item_name || !Number.isFinite(payload.quantity_needed)) {
    setAdminMessage(
      section.formMessage,
      "error",
      "Complétez au minimum le nom et la quantité voulue.",
    );
    return;
  }

  const isEditing = Boolean(section.id?.value);
  section.submit.disabled = true;

  const query = isEditing
    ? supabase
        .from("needed_equipment")
        .update(payload)
        .eq("id", section.id.value)
    : supabase.from("needed_equipment").insert([payload]);
  const { error } = await query;

  if (error) {
    setAdminMessage(
      section.formMessage,
      "error",
      error.message || "Impossible d’enregistrer ce besoin matériel.",
    );
    section.submit.disabled = false;
    return;
  }

  resetNeededEquipmentForm({ keepMessage: true });
  setAdminMessage(
    section.formMessage,
    "success",
    isEditing ? "Besoin mis à jour." : "Besoin matériel ajouté.",
  );
  section.submit.disabled = false;
  await refreshNeededEquipmentSection();
}

async function handleEventAdminFormSubmit(event) {
  event.preventDefault();

  const section = adminDom?.events;
  if (!section?.form || !section.submit) {
    return;
  }

  const payload = {
    title: section.title?.value.trim() ?? "",
    short_description: section.shortDescription?.value.trim() ?? "",
    description: normalizeOptionalString(section.description?.value),
    event_date: section.date?.value ?? "",
    start_time: normalizeOptionalString(section.startTime?.value),
    end_time: normalizeOptionalString(section.endTime?.value),
    location: normalizeOptionalString(section.location?.value),
    image_url: normalizeOptionalString(section.imageUrl?.value),
  };

  if (!payload.title || !payload.short_description || !payload.event_date) {
    setAdminMessage(
      section.formMessage,
      "error",
      "Renseignez au minimum le titre, le résumé et la date.",
    );
    return;
  }

  const isEditing = Boolean(section.id?.value);
  section.submit.disabled = true;

  const query = isEditing
    ? supabase.from("events").update(payload).eq("id", section.id.value)
    : supabase.from("events").insert([payload]);
  const { error } = await query;

  if (error) {
    setAdminMessage(
      section.formMessage,
      "error",
      error.message || "Impossible d’enregistrer cet événement.",
    );
    section.submit.disabled = false;
    return;
  }

  resetEventsAdminForm({ keepMessage: true });
  setAdminMessage(
    section.formMessage,
    "success",
    isEditing ? "Événement mis à jour." : "Événement ajouté.",
  );
  section.submit.disabled = false;
  await refreshEventsAdminSection();
}

async function handleSessionsAdminFormSubmit(event) {
  event.preventDefault();

  const section = adminDom?.sessions;
  if (!section?.form || !section.submit) {
    return;
  }

  const selectedModuleIds = getSelectedSessionModuleIds();
  const payload = {
    title: section.title?.value.trim() ?? "",
    session_date: section.date?.value ?? "",
    start_time: normalizeOptionalString(section.startTime?.value),
    end_time: normalizeOptionalString(section.endTime?.value),
    level: normalizeOptionalString(section.level?.value),
    seats_total: normalizeOptionalNumber(section.seatsTotal?.value),
    notes: normalizeOptionalString(section.notes?.value),
  };

  if (!payload.title || !payload.session_date) {
    setAdminMessage(
      section.formMessage,
      "error",
      "Renseignez au minimum le titre et la date de session.",
    );
    return;
  }

  if (!selectedModuleIds.length) {
    setAdminMessage(
      section.formMessage,
      "error",
      "Sélectionnez au moins un module lié à la session.",
    );
    return;
  }

  section.submit.disabled = true;

  const sessionId = section.id?.value || null;
  let targetSessionId = sessionId;

  if (sessionId) {
    const { error } = await supabase
      .from("sessions")
      .update(payload)
      .eq("id", sessionId);

    if (error) {
      setAdminMessage(
        section.formMessage,
        "error",
        error.message || "Impossible de mettre à jour cette session.",
      );
      section.submit.disabled = false;
      return;
    }
  } else {
    const { data, error } = await supabase
      .from("sessions")
      .insert([payload])
      .select("id")
      .single();

    if (error || !data?.id) {
      setAdminMessage(
        section.formMessage,
        "error",
        error?.message || "Impossible de créer cette session.",
      );
      section.submit.disabled = false;
      return;
    }

    targetSessionId = data.id;
  }

  const { error: deleteLinksError } = await supabase
    .from("session_modules")
    .delete()
    .eq("session_id", targetSessionId);

  if (deleteLinksError) {
    setAdminMessage(
      section.formMessage,
      "error",
      deleteLinksError.message || "Impossible de synchroniser les modules liés.",
    );
    section.submit.disabled = false;
    return;
  }

  const linksPayload = selectedModuleIds.map((moduleId) => ({
    session_id: targetSessionId,
    module_id: moduleId,
  }));

  const { error: insertLinksError } = await supabase
    .from("session_modules")
    .insert(linksPayload);

  if (insertLinksError) {
    setAdminMessage(
      section.formMessage,
      "error",
      insertLinksError.message || "Impossible d’enregistrer les modules liés.",
    );
    section.submit.disabled = false;
    return;
  }

  resetSessionsAdminForm({ keepMessage: true });
  setAdminMessage(
    section.formMessage,
    "success",
    sessionId ? "Session mise à jour." : "Session créée.",
  );
  section.submit.disabled = false;

  await Promise.all([refreshSessionsAdminSection(), refreshRegistrationsAdminSection()]);
}

function populateInventoryForm(recordId) {
  const section = adminDom?.inventory;
  const record = findAdminRecordById(adminState.inventory, recordId);

  if (!section || !record) {
    return;
  }

  section.id.value = record.id;
  section.itemName.value = record.itemName;
  section.internalId.value = record.internalId;
  section.category.value = record.category;
  section.quantity.value = String(record.quantity ?? 0);
  section.condition.value = record.condition;
  section.location.value = record.location;
  updateAdminFormMode("inventory", adminFormLabels.inventory);
  setAdminMessage(section.formMessage, "success", "Mode modification activé.");
}

function populateNeededEquipmentForm(recordId) {
  const section = adminDom?.neededEquipment;
  const record = findAdminRecordById(adminState.neededEquipment, recordId);

  if (!section || !record) {
    return;
  }

  section.id.value = record.id;
  section.itemName.value = record.itemName;
  section.category.value = record.category;
  section.quantity.value = String(record.quantityNeeded ?? 0);
  section.priority.value = record.priority;
  section.status.value = record.status;
  section.note.value = record.note;
  updateAdminFormMode("needed-equipment", adminFormLabels.neededEquipment);
  setAdminMessage(section.formMessage, "success", "Mode modification activé.");
}

function populateEventsAdminForm(recordId) {
  const section = adminDom?.events;
  const record = findAdminRecordById(adminState.events, recordId);

  if (!section || !record) {
    return;
  }

  section.id.value = record.id;
  section.title.value = record.title;
  section.shortDescription.value = record.shortDescription;
  section.description.value = record.description;
  section.date.value = record.eventDate;
  section.startTime.value = record.startTime;
  section.endTime.value = record.endTime;
  section.location.value = record.location;
  section.imageUrl.value = record.imageUrl;
  updateAdminFormMode("events-admin", adminFormLabels.event);
  setAdminMessage(section.formMessage, "success", "Mode modification activé.");
}

function populateSessionsAdminForm(recordId) {
  const section = adminDom?.sessions;
  const record = findAdminRecordById(adminState.sessions, recordId);

  if (!section || !record) {
    return;
  }

  section.id.value = record.id;
  section.title.value = record.title;
  section.date.value = record.sessionDate;
  section.startTime.value = record.startTime;
  section.endTime.value = record.endTime;
  section.level.value = record.level;
  section.seatsTotal.value = record.seatsTotal ?? "";
  section.notes.value = record.notes;
  section.moduleOptions.innerHTML = renderSessionModuleOptions(record.moduleIds);
  updateAdminFormMode("sessions-admin", adminFormLabels.session);
  setAdminMessage(section.formMessage, "success", "Mode modification activé.");
}

function resetInventoryForm({ keepMessage = false } = {}) {
  const section = adminDom?.inventory;
  if (!section?.form || !section.id) {
    return;
  }

  section.form.reset();
  section.id.value = "";
  updateAdminFormMode("inventory", adminFormLabels.inventory);

  if (!keepMessage) {
    setAdminMessage(section.formMessage);
  }
}

function resetNeededEquipmentForm({ keepMessage = false } = {}) {
  const section = adminDom?.neededEquipment;
  if (!section?.form || !section.id) {
    return;
  }

  section.form.reset();
  section.id.value = "";
  updateAdminFormMode("needed-equipment", adminFormLabels.neededEquipment);

  if (!keepMessage) {
    setAdminMessage(section.formMessage);
  }
}

function resetEventsAdminForm({ keepMessage = false } = {}) {
  const section = adminDom?.events;
  if (!section?.form || !section.id) {
    return;
  }

  section.form.reset();
  section.id.value = "";
  updateAdminFormMode("events-admin", adminFormLabels.event);

  if (!keepMessage) {
    setAdminMessage(section.formMessage);
  }
}

function resetSessionsAdminForm({ keepMessage = false } = {}) {
  const section = adminDom?.sessions;
  if (!section?.form || !section.id) {
    return;
  }

  section.form.reset();
  section.id.value = "";
  section.moduleOptions.innerHTML = renderSessionModuleOptions([]);
  updateAdminFormMode("sessions-admin", adminFormLabels.session);

  if (!keepMessage) {
    setAdminMessage(section.formMessage);
  }
}

async function deleteInventoryRecord(recordId, button) {
  const section = adminDom?.inventory;
  const record = findAdminRecordById(adminState.inventory, recordId);

  if (!section || !record || !window.confirm(`Supprimer ${record.itemName} de l’inventaire ?`)) {
    return;
  }

  button.disabled = true;
  const { error } = await supabase.from("inventory").delete().eq("id", recordId);

  if (error) {
    setAdminMessage(
      section.formMessage,
      "error",
      error.message || "Impossible de supprimer cet item.",
    );
    button.disabled = false;
    return;
  }

  if (section.id.value === String(recordId)) {
    resetInventoryForm();
  }

  setAdminMessage(section.formMessage, "success", "Item supprimé.");
  await refreshInventorySection();
}

async function deleteNeededEquipmentRecord(recordId, button) {
  const section = adminDom?.neededEquipment;
  const record = findAdminRecordById(adminState.neededEquipment, recordId);

  if (!section || !record || !window.confirm(`Supprimer ${record.itemName} de la liste des besoins ?`)) {
    return;
  }

  button.disabled = true;
  const { error } = await supabase
    .from("needed_equipment")
    .delete()
    .eq("id", recordId);

  if (error) {
    setAdminMessage(
      section.formMessage,
      "error",
      error.message || "Impossible de supprimer ce besoin.",
    );
    button.disabled = false;
    return;
  }

  if (section.id.value === String(recordId)) {
    resetNeededEquipmentForm();
  }

  setAdminMessage(section.formMessage, "success", "Besoin supprimé.");
  await refreshNeededEquipmentSection();
}

async function deleteEventAdminRecord(recordId, button) {
  const section = adminDom?.events;
  const record = findAdminRecordById(adminState.events, recordId);

  if (!section || !record || !window.confirm(`Supprimer l’événement ${record.title} ?`)) {
    return;
  }

  button.disabled = true;
  const { error } = await supabase.from("events").delete().eq("id", recordId);

  if (error) {
    setAdminMessage(
      section.formMessage,
      "error",
      error.message || "Impossible de supprimer cet événement.",
    );
    button.disabled = false;
    return;
  }

  if (section.id.value === String(recordId)) {
    resetEventsAdminForm();
  }

  setAdminMessage(section.formMessage, "success", "Événement supprimé.");
  await refreshEventsAdminSection();
}

async function deleteSessionsAdminRecord(recordId, button) {
  const section = adminDom?.sessions;
  const record = findAdminRecordById(adminState.sessions, recordId);

  if (!section || !record || !window.confirm(`Supprimer la session ${record.title} ?`)) {
    return;
  }

  button.disabled = true;
  const { error } = await supabase.from("sessions").delete().eq("id", recordId);

  if (error) {
    setAdminMessage(
      section.formMessage,
      "error",
      error.message || "Impossible de supprimer cette session.",
    );
    button.disabled = false;
    return;
  }

  if (section.id.value === String(recordId)) {
    resetSessionsAdminForm();
  }

  setAdminMessage(section.formMessage, "success", "Session supprimée.");
  await Promise.all([refreshSessionsAdminSection(), refreshRegistrationsAdminSection()]);
}

async function updateRegistrationStatus(recordId, button) {
  const section = adminDom?.registrations;
  const selectNode = section?.list?.querySelector(
    `[data-registration-id="${CSS.escape(String(recordId))}"]`,
  );

  if (!section || !selectNode) {
    return;
  }

  button.disabled = true;
  setAdminMessage(section.message);

  const { error } = await supabase
    .from("registrations")
    .update({ status: selectNode.value })
    .eq("id", recordId);

  if (error) {
    setAdminMessage(
      section.message,
      "error",
      error.message || "Impossible de mettre à jour le statut.",
    );
    button.disabled = false;
    return;
  }

  setAdminMessage(section.message, "success", "Statut mis à jour.");
  await Promise.all([refreshRegistrationsAdminSection(), refreshSessionsAdminSection()]);
}

async function deleteRegistrationRecord(recordId, button) {
  const section = adminDom?.registrations;
  const record = findAdminRecordById(adminState.registrations, recordId);

  if (
    !section ||
    !record ||
    !window.confirm(
      `Supprimer l’inscription de ${record.firstName} ${record.lastName} pour ${record.sessionTitle} ?`,
    )
  ) {
    return;
  }

  button.disabled = true;

  const { error } = await supabase.from("registrations").delete().eq("id", recordId);

  if (error) {
    setAdminMessage(
      section.message,
      "error",
      error.message || "Impossible de supprimer cette inscription.",
    );
    button.disabled = false;
    return;
  }

  setAdminMessage(section.message, "success", "Inscription supprimée.");
  await Promise.all([refreshRegistrationsAdminSection(), refreshSessionsAdminSection()]);
}

function normalizeInventoryRecord(item) {
  return {
    id: item.id,
    itemName: item.item_name ?? item.name ?? "",
    internalId: item.internal_id ?? "",
    category: item.category ?? "",
    quantity: normalizeOptionalNumber(item.quantity) ?? 0,
    condition: item.condition ?? "",
    location: item.location ?? "",
  };
}

function normalizeNeededEquipmentRecord(item) {
  return {
    id: item.id,
    itemName: item.item_name ?? item.name ?? "",
    category: item.category ?? "",
    quantityNeeded: normalizeOptionalNumber(item.quantity_needed ?? item.wanted) ?? 0,
    priority: item.priority ?? "",
    status: item.status ?? "",
    note: item.note ?? "",
  };
}

function normalizeAdminEventRecord(item) {
  const startTime = item.start_time ?? item.startTime ?? "";
  const endTime = item.end_time ?? item.endTime ?? "";

  return {
    id: item.id,
    title: item.title ?? "",
    shortDescription: item.short_description ?? item.description ?? "",
    description: item.description ?? "",
    eventDate: item.event_date ?? item.date ?? "",
    startTime,
    endTime,
    timeRange: formatTimeRange(startTime, endTime),
    location: item.location ?? "",
    imageUrl: item.image_url ?? "",
  };
}

function normalizeAdminModuleRecord(item) {
  return {
    id: item.id,
    title: item.title ?? item.name ?? `Module ${item.id}`,
  };
}

function normalizeSessionModuleLink(item) {
  return {
    sessionId: item.session_id,
    moduleId: item.module_id,
  };
}

function normalizeAdminSessionRecord(session) {
  const normalized = normalizeSession(session);

  return {
    id: normalized.id,
    title: session.title ?? normalized.title,
    sessionDate: session.session_date ?? session.date ?? "",
    startTime: session.start_time ?? session.startTime ?? "",
    endTime: session.end_time ?? session.endTime ?? "",
    timeRange: normalized.timeRange,
    level: session.level ?? normalized.level,
    seatsTotal: normalizeOptionalNumber(session.seats_total ?? session.total_seats),
    seatsRemaining: normalized.seatsRemaining,
    modules: normalized.modules,
    notes: session.notes ?? normalized.notes ?? "",
  };
}

function attachSessionModuleIds(sessionRecord) {
  return {
    ...sessionRecord,
    moduleIds: adminState.sessionModules
      .filter((item) => String(item.sessionId) === String(sessionRecord.id))
      .map((item) => String(item.moduleId)),
  };
}

function normalizeAdminRegistrationRecord(item) {
  const createdSource =
    item.created_at ?? item.registration_created_at ?? item.inserted_at ?? null;

  return {
    id: item.registration_id ?? item.id,
    firstName: item.first_name ?? "",
    lastName: item.last_name ?? "",
    email: item.email ?? "",
    login42: item.login_42 ?? "",
    status: item.status ?? "registered",
    sessionTitle: item.session_title ?? item.title ?? "Session",
    sessionDate: item.session_date ?? item.date ?? "",
    createdLabel: createdSource ? formatSafeDateTime(createdSource) : "Date non disponible",
  };
}

function updateAdminFormMode(sectionId, copy) {
  const titleNode = document.getElementById(`${sectionId}-form-title`);
  const submitButton = document.getElementById(`${sectionId}-submit`);
  const cancelButton = document.getElementById(`${sectionId}-cancel-edit`);
  const hiddenInput = document.getElementById(`${sectionId}-id`);
  const isEditing = Boolean(hiddenInput?.value);

  if (titleNode) {
    titleNode.textContent = isEditing ? copy.editTitle : copy.createTitle;
  }

  if (submitButton) {
    submitButton.textContent = isEditing ? copy.editButton : copy.createButton;
  }

  if (cancelButton) {
    cancelButton.classList.toggle("is-hidden", !isEditing);
  }
}

function setAdminMessage(node, state, text) {
  if (!node) {
    return;
  }

  node.textContent = text ?? "";

  if (state && text) {
    node.dataset.state = state;
    return;
  }

  delete node.dataset.state;
}

function findAdminRecordById(collection, recordId) {
  return collection.find((item) => String(item.id) === String(recordId));
}

function formatAdminCount(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getSelectedSessionModuleIds() {
  const section = adminDom?.sessions;

  if (!section?.moduleOptions) {
    return [];
  }

  return Array.from(
    section.moduleOptions.querySelectorAll('input[name="module_ids"]:checked'),
  ).map((input) => input.value);
}

function normalizeOptionalString(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed : null;
}

function formatSafeDate(value) {
  return value ? formatDate(value) : "Date à confirmer";
}

function formatSafeDateTime(value) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Date non disponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function moduleLink(moduleId) {
  return `module.html?id=${moduleId}`;
}

function registrationLink(sessionId) {
  return `inscription.html?session_id=${encodeURIComponent(sessionId)}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function formatTimeRange(startTime, endTime) {
  const start = formatTime(startTime);
  const end = formatTime(endTime);

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || "";
}

function formatTime(timeValue) {
  if (!timeValue) {
    return "";
  }

  const [hours = "", minutes = ""] = String(timeValue).split(":");

  if (!hours || !minutes) {
    return String(timeValue);
  }

  return `${hours}:${minutes}`;
}

function renderEventsLoadingState(label = "Chargement", text = "Les événements planifiés sont en cours de chargement depuis Supabase.") {
  return `
    <article class="info-card event-card animate-rise">
      <span class="event-date-badge">${label}</span>
      <h3>Récupération des événements</h3>
      <p>${text}</p>
    </article>
  `;
}

function renderEventsEmptyState(text = "Le fablab n’a pas encore publié de prochain rendez-vous.") {
  return `
    <article class="info-card event-card animate-rise">
      <span class="event-date-badge">Agenda</span>
      <h3>Aucun événement planifié pour le moment</h3>
      <p>${text}</p>
    </article>
  `;
}

function renderEventsErrorState(text = "Le planning n’a pas pu être récupéré pour le moment. Réessayez un peu plus tard.") {
  return `
    <article class="info-card event-card animate-rise">
      <span class="event-date-badge">Erreur</span>
      <h3>Impossible de charger les événements</h3>
      <p>${text}</p>
    </article>
  `;
}

function renderSessionsLoadingState() {
  return `
    <article class="info-card session-card animate-rise">
      <div class="session-head">
        <span class="category-badge">Chargement</span>
        <span class="subtle-badge">Sessions</span>
      </div>
      <h3>Récupération des sessions</h3>
      <p>Les prochaines sessions de cours sont en cours de chargement depuis Supabase.</p>
    </article>
  `;
}

function renderSessionsEmptyState() {
  return `
    <article class="info-card session-card animate-rise">
      <div class="session-head">
        <span class="category-badge">Agenda</span>
        <span class="subtle-badge">Sessions</span>
      </div>
      <h3>Aucune session prévue pour le moment</h3>
      <p>Les prochaines sessions de cours seront affichées ici dès leur publication.</p>
    </article>
  `;
}

function renderSessionsErrorState() {
  return `
    <article class="info-card session-card animate-rise">
      <div class="session-head">
        <span class="category-badge">Erreur</span>
        <span class="subtle-badge">Sessions</span>
      </div>
      <h3>Impossible de charger les sessions</h3>
      <p>Les sessions de cours ne peuvent pas être récupérées pour le moment. Réessayez plus tard.</p>
    </article>
  `;
}

function renderRegistrationState(message) {
  return `
    <div>
      <strong>Session indisponible</strong>
      <p>${message}</p>
    </div>
  `;
}

function renderRegistrationAuthGate() {
  return `
    <div class="registration-gate">
      <div>
        <strong>Vous devez être connecté pour vous inscrire à une session.</strong>
        <p>
          Connectez-vous à votre espace utilisateur ou créez un compte pour finaliser votre
          inscription et suivre vos sessions.
        </p>
      </div>
      <div class="user-actions-row">
        <a class="button button-primary" href="${buildLoginRedirectHref(getCurrentRelativeUrl())}">
          Se connecter
        </a>
        <a class="button button-ghost" href="${buildSignupRedirectHref(getCurrentRelativeUrl())}">
          Créer un compte
        </a>
      </div>
    </div>
  `;
}

function renderRegistrationSummary(session) {
  return `
    <span class="category-badge">Session sélectionnée</span>
    <h3>${session.title}</h3>
    <div class="session-meta">
      <div class="inline-detail">${formatDate(session.date)}</div>
      ${session.timeRange ? `<div class="inline-detail">${session.timeRange}</div>` : ""}
      ${session.seatLabel ? `<div class="inline-detail">${session.seatLabel}</div>` : ""}
    </div>
    ${
      session.modules.length
        ? `<div class="session-modules">${session.modules
            .map((item) => `<span class="tag">${item}</span>`)
            .join("")}</div>`
        : ""
    }
    ${session.notes ? `<p class="session-notes">${session.notes}</p>` : ""}
  `;
}

function renderUserStateCard(label, title, text) {
  return `
    <article class="info-card event-card animate-rise">
      <span class="event-date-badge">${label}</span>
      <h3>${title}</h3>
      <p>${text}</p>
    </article>
  `;
}

function renderUpcomingRegistrationCard(registration) {
  return `
    <article class="info-card session-card user-session-card animate-rise">
      <div class="session-head">
        <span class="category-badge">${formatSafeDate(registration.sessionDate)}</span>
        <span class="subtle-badge">${registration.statusLabel}</span>
      </div>
      <h3>${registration.title}</h3>
      <div class="session-meta">
        ${
          registration.timeRange
            ? `<div class="inline-detail">${registration.timeRange}</div>`
            : ""
        }
        ${registration.level ? `<div class="inline-detail">${registration.level}</div>` : ""}
      </div>
      ${registration.notes ? `<p class="session-notes">${registration.notes}</p>` : ""}
      <div class="user-actions-row">
        ${
          registration.googleCalendarLink
            ? `<a class="button button-ghost" href="${registration.googleCalendarLink}" target="_blank" rel="noreferrer">
                Ajouter à Google Calendar
              </a>`
            : ""
        }
        <button
          class="button button-danger"
          data-action="cancel-registration"
          data-id="${registration.registrationId}"
          type="button"
        >
          Annuler l’inscription
        </button>
      </div>
    </article>
  `;
}

function renderCompletedModuleCard(moduleItem) {
  return `
    <article class="info-card user-module-card animate-rise">
      <div class="card-topline">
        <span class="eyebrow eyebrow-tight">Module passé</span>
        ${moduleItem.status ? `<span>${moduleItem.status}</span>` : ""}
      </div>
      <h3>${moduleItem.title}</h3>
      <p>${moduleItem.shortDescription}</p>
      <div class="session-meta">
        ${moduleItem.duration ? `<div class="inline-detail">${moduleItem.duration}</div>` : ""}
        ${
          moduleItem.sessionDate
            ? `<div class="inline-detail">${formatSafeDate(moduleItem.sessionDate)}</div>`
            : ""
        }
      </div>
      ${
        moduleItem.sessionTitle
          ? `<p class="session-notes">Session associée : ${moduleItem.sessionTitle}</p>`
          : ""
      }
    </article>
  `;
}

function renderCancelledRegistrationCard(registration) {
  return `
    <article class="info-card session-card animate-rise">
      <div class="session-head">
        <span class="category-badge">${formatSafeDate(registration.sessionDate)}</span>
        <span class="subtle-badge">${registration.statusLabel}</span>
      </div>
      <h3>${registration.title}</h3>
      <div class="session-meta">
        ${
          registration.timeRange
            ? `<div class="inline-detail">${registration.timeRange}</div>`
            : ""
        }
      </div>
      ${registration.notes ? `<p class="session-notes">${registration.notes}</p>` : ""}
    </article>
  `;
}

async function getCurrentSupabaseSession() {
  const { data, error } = await supabase.auth.getSession();
  return {
    session: data?.session ?? null,
    error,
  };
}

function getCurrentRelativeUrl() {
  const pathname = window.location.pathname.split("/").pop() || routeMap.home;
  return `${pathname}${window.location.search}`;
}

function sanitizeRedirectTarget(rawTarget, fallback) {
  const candidate = String(rawTarget ?? "").trim();

  if (!candidate) {
    return fallback;
  }

  if (
    candidate.startsWith("http://") ||
    candidate.startsWith("https://") ||
    candidate.startsWith("//") ||
    candidate.startsWith("/")
  ) {
    return fallback;
  }

  return candidate;
}

function getAuthRedirectTarget(fallback = routeMap.account) {
  return sanitizeRedirectTarget(params.get("redirect"), fallback);
}

function buildLoginRedirectHref(target = getCurrentRelativeUrl()) {
  return `${routeMap.login}?redirect=${encodeURIComponent(target)}`;
}

function buildSignupRedirectHref(target = getCurrentRelativeUrl()) {
  return `${routeMap.signup}?redirect=${encodeURIComponent(target)}`;
}

async function fetchUserProfileRecord(userId) {
  if (!userId) {
    return { data: null, error: null };
  }

  return supabase
    .from("profiles")
    .select("id, email, display_name, login_42, role")
    .eq("id", userId)
    .maybeSingle();
}

async function saveUserProfileRecord(userId, payload) {
  if (!userId) {
    return { error: new Error("Utilisateur introuvable.") };
  }

  const normalizedPayload = {
    id: userId,
    email: payload.email,
    display_name: payload.displayName || null,
    login_42: payload.login42 || null,
  };

  const upsertResult = await supabase
    .from("profiles")
    .upsert([normalizedPayload], { onConflict: "id" });

  if (!upsertResult.error) {
    return upsertResult;
  }

  return supabase
    .from("profiles")
    .update({
      email: normalizedPayload.email,
      display_name: normalizedPayload.display_name,
      login_42: normalizedPayload.login_42,
    })
    .eq("id", userId);
}

function normalizeUserDashboardSummary(summaryRow, profileRow, sessionUser) {
  return {
    displayName:
      summaryRow?.display_name ??
      profileRow?.display_name ??
      sessionUser?.user_metadata?.display_name ??
      "",
    email: summaryRow?.email ?? profileRow?.email ?? sessionUser?.email ?? "",
    login42:
      summaryRow?.login_42 ??
      profileRow?.login_42 ??
      sessionUser?.user_metadata?.login_42 ??
      "",
    upcomingRegistrationsCount:
      normalizeOptionalNumber(summaryRow?.upcoming_registrations_count) ?? 0,
    completedModulesCount:
      normalizeOptionalNumber(summaryRow?.completed_modules_count) ?? 0,
  };
}

function normalizeUpcomingRegistrationRecord(row, calendarRow) {
  const startTime =
    row?.start_time ?? row?.session_start_time ?? calendarRow?.start_time ?? "";
  const endTime =
    row?.end_time ?? row?.session_end_time ?? calendarRow?.end_time ?? "";
  const status = row?.status ?? "registered";

  return {
    registrationId: row?.registration_id ?? row?.id ?? calendarRow?.registration_id ?? "",
    title:
      row?.session_title ??
      row?.title ??
      calendarRow?.session_title ??
      "Session",
    sessionDate:
      row?.session_date ??
      row?.date ??
      calendarRow?.session_date ??
      "",
    timeRange: formatTimeRange(startTime, endTime),
    level: row?.level ?? row?.session_level ?? "",
    notes: row?.notes ?? row?.session_notes ?? calendarRow?.notes ?? "",
    status,
    statusLabel: formatRegistrationStatus(status),
    googleCalendarLink: buildGoogleCalendarLink({
      title:
        row?.session_title ??
        row?.title ??
        calendarRow?.session_title ??
        "Session Fablab 42 Marseille",
      googleStart: calendarRow?.google_start ?? row?.google_start ?? "",
      googleEnd: calendarRow?.google_end ?? row?.google_end ?? "",
      notes: row?.notes ?? row?.session_notes ?? calendarRow?.notes ?? "",
    }),
  };
}

function normalizeCompletedModuleRecord(row) {
  return {
    title: row?.module_title ?? row?.title ?? "Module",
    shortDescription:
      row?.short_description ??
      row?.module_short_description ??
      row?.description ??
      "",
    duration: row?.duration ?? row?.module_duration ?? "Durée à confirmer",
    sessionTitle: row?.session_title ?? row?.title_session ?? "",
    sessionDate: row?.session_date ?? row?.date ?? "",
    status: formatRegistrationStatus(row?.status ?? row?.registration_status ?? ""),
  };
}

function formatRegistrationStatus(status) {
  const labelMap = {
    registered: "Inscription confirmée",
    cancelled: "Inscription annulée",
    attended: "Participé",
    completed: "Complété",
    confirmed: "Confirmé",
    waitlisted: "Liste d’attente",
  };

  return labelMap[status] ?? status ?? "Statut inconnu";
}

function buildGoogleCalendarLink({ title, googleStart, googleEnd, notes }) {
  if (!googleStart || !googleEnd) {
    return "";
  }

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title || "Session Fablab 42 Marseille");
  url.searchParams.set("dates", `${googleStart}/${googleEnd}`);

  if (notes) {
    url.searchParams.set("details", notes);
  }

  return url.toString();
}

function prefillRegistrationFormFromProfile({
  firstNameInput,
  lastNameInput,
  emailInput,
  login42Input,
  profile,
  sessionUser,
}) {
  const displayName =
    profile?.display_name ?? sessionUser?.user_metadata?.display_name ?? "";
  const [firstName = "", ...lastNameParts] = displayName.trim().split(/\s+/).filter(Boolean);
  const lastName = lastNameParts.join(" ");

  if (firstNameInput && !firstNameInput.value && firstName) {
    firstNameInput.value = firstName;
  }

  if (lastNameInput && !lastNameInput.value && lastName) {
    lastNameInput.value = lastName;
  }

  if (emailInput && !emailInput.value) {
    emailInput.value = profile?.email ?? sessionUser?.email ?? "";
  }

  if (login42Input && !login42Input.value) {
    login42Input.value = profile?.login_42 ?? sessionUser?.user_metadata?.login_42 ?? "";
  }
}

function renderModuleSessionItem(session) {
  return `
    <a class="schedule-item" href="${registrationLink(session.id)}">
      <div>
        <strong>${formatDate(session.date)}</strong>
        <span>${session.timeRange || "Horaire à confirmer"}</span>
        ${session.seatLabel ? `<span>${session.seatLabel}</span>` : ""}
      </div>
      <span>→</span>
    </a>
  `;
}

function renderModuleSessionsLoadingState() {
  return `
    <div class="empty-state">
      <span>Chargement des prochaines sessions...</span>
    </div>
  `;
}

function renderModuleSessionsEmptyState() {
  return `
    <div class="empty-state">
      <span>Aucune session planifiée pour le moment.</span>
    </div>
  `;
}

function renderModuleSessionsErrorState() {
  return `
    <div class="empty-state">
      <span>Impossible de charger les prochaines sessions pour le moment.</span>
    </div>
  `;
}

async function fetchEvents(limit) {
  let query = supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  return query;
}

async function fetchSessions() {
  return supabase
    .from("sessions_with_modules")
    .select("*")
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });
}

function bindInteractions() {
  const menuButton = document.querySelector(".menu-toggle");
  const navPanel = document.querySelector(".nav-panel");

  if (menuButton && navPanel) {
    menuButton.addEventListener("click", () => {
      const isOpen = navPanel.classList.toggle("nav-panel-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }
}

async function hydrateEventsPage() {
  if (page !== "events") {
    return;
  }

  const eventsGrid = document.getElementById("events-grid");

  if (!eventsGrid) {
    return;
  }

  const { data, error } = await fetchEvents();

  console.log("events data:", data);
  console.log("events error:", error);

  if (error) {
    eventsGrid.innerHTML = renderEventsErrorState();
    return;
  }

  if (!data || data.length === 0) {
    eventsGrid.innerHTML = renderEventsEmptyState();
    return;
  }

  eventsGrid.innerHTML = data.map(renderEventCard).join("");
}

async function hydrateHomeEventsSection() {
  if (page !== "home") {
    return;
  }

  const eventsGrid = document.getElementById("home-events-grid");

  if (!eventsGrid) {
    return;
  }

  const { data, error } = await fetchEvents(3);

  console.log("home events data:", data);
  console.log("home events error:", error);

  if (error) {
    eventsGrid.innerHTML = renderEventsErrorState(
      "Les prochains événements ne peuvent pas être affichés pour le moment.",
    );
    return;
  }

  if (!data || data.length === 0) {
    eventsGrid.innerHTML = renderEventsEmptyState(
      "Le prochain planning sera affiché ici dès qu’un événement sera publié.",
    );
    return;
  }

  eventsGrid.innerHTML = data.map(renderEventCard).join("");
}

async function hydrateSessionsPage() {
  if (page !== "sessions") {
    return;
  }

  const sessionsGrid = document.getElementById("sessions-grid");

  if (!sessionsGrid) {
    return;
  }

  const { data, error } = await fetchSessions();

  console.log("sessions data:", data);
  console.log("sessions error:", error);

  if (error) {
    sessionsGrid.innerHTML = renderSessionsErrorState();
    return;
  }

  if (!data || data.length === 0) {
    sessionsGrid.innerHTML = renderSessionsEmptyState();
    return;
  }

  sessionsGrid.innerHTML = data.map(renderSessionCard).join("");
}

async function hydrateAuthNavigation() {
  const authLink = document.getElementById("nav-auth-link");

  if (!authLink) {
    return;
  }

  const { session, error } = await getCurrentSupabaseSession();

  if (error || !session) {
    authLink.href = routeMap.login;
    authLink.textContent = "Connexion";
    return;
  }

  authLink.href = routeMap.account;
  authLink.textContent = "Mon espace";
}

async function hydrateRegistrationPage() {
  if (page !== "registration") {
    return;
  }

  const sessionSelect = document.getElementById("registration-session-select");
  const stateBox = document.getElementById("registration-state-box");
  const summaryNode = document.getElementById("registration-session-summary");
  const formNode = document.querySelector("[data-mock-registration]");
  const successBox = document.getElementById("registration-success");
  const submitButton = document.getElementById("registration-submit-button");
  const firstNameInput = document.getElementById("registration-first-name");
  const lastNameInput = document.getElementById("registration-last-name");
  const emailInput = document.getElementById("registration-email");
  const login42Input = document.getElementById("registration-login-42");

  if (
    !sessionSelect ||
    !stateBox ||
    !summaryNode ||
    !formNode ||
    !successBox ||
    !submitButton ||
    !firstNameInput ||
    !lastNameInput ||
    !emailInput ||
    !login42Input
  ) {
    return;
  }

  const requestedSessionId = params.get("session_id") ?? params.get("id");
  let availableSessions = [];
  let activeSession = null;

  const showRegistrationLoadError = (message) => {
    stateBox.classList.remove("is-hidden");
    stateBox.innerHTML = renderRegistrationState(message);
    formNode.classList.add("is-hidden");
    successBox.classList.add("is-hidden");
  };

  const { session: currentSession, error: currentSessionError } = await getCurrentSupabaseSession();

  if (currentSessionError) {
    showRegistrationLoadError(
      "Votre session utilisateur n’a pas pu être vérifiée. Réessayez dans un instant.",
    );
    summaryNode.innerHTML = `
      <span class="category-badge">Inscription</span>
      <h3>Connexion impossible à vérifier</h3>
      <p>Reconnectez-vous si le problème persiste.</p>
    `;
    return;
  }

  if (!currentSession) {
    stateBox.classList.remove("is-hidden");
    stateBox.innerHTML = renderRegistrationAuthGate();
    formNode.classList.add("is-hidden");
    successBox.classList.add("is-hidden");
    summaryNode.innerHTML = `
      <span class="category-badge">Inscription</span>
      <h3>Connexion requise</h3>
      <p>
        Connectez-vous pour réserver une place et retrouver ensuite cette session dans votre
        espace personnel.
      </p>
    `;
    return;
  }

  const { data: currentProfile } = await fetchUserProfileRecord(currentSession.user.id);

  const updateSummary = (session) => {
    summaryNode.innerHTML = renderRegistrationSummary(session);
  };

  const hydrateAvailableSessions = async (preferredSessionId = requestedSessionId) => {
    const { data, error } = await fetchSessions();

    console.log("registration sessions data:", data);
    console.log("registration sessions error:", error);

    if (error) {
      showRegistrationLoadError(
        "Impossible de charger les sessions pour le moment. Réessayez plus tard.",
      );
      summaryNode.innerHTML = `
        <span class="category-badge">Inscription</span>
        <h3>Chargement impossible</h3>
        <p>Les sessions n’ont pas pu être récupérées depuis la base.</p>
      `;
      return false;
    }

    const allSessions = (data ?? []).map(normalizeSession);
    availableSessions = allSessions.filter(
      (session) => session.seatsRemaining === null || session.seatsRemaining > 0,
    );

    if (!availableSessions.length) {
      showRegistrationLoadError(
        "Aucune session réservable n’est disponible pour le moment.",
      );
      summaryNode.innerHTML = `
        <span class="category-badge">Inscription</span>
        <h3>Aucune session disponible</h3>
        <p>Les prochaines ouvertures d’inscription apparaîtront ici.</p>
      `;
      return false;
    }

    formNode.classList.remove("is-hidden");
    stateBox.classList.add("is-hidden");
    sessionSelect.disabled = false;
    sessionSelect.innerHTML = availableSessions
      .map((session) => {
        const optionLabel = [
          session.title,
          formatDate(session.date),
          session.timeRange,
        ]
          .filter(Boolean)
          .join(" · ");

        return `<option value="${session.id}">${optionLabel}</option>`;
      })
      .join("");

    activeSession =
      availableSessions.find((session) => String(session.id) === String(preferredSessionId)) ??
      availableSessions[0];

    sessionSelect.value = String(activeSession.id);
    updateSummary(activeSession);
    return true;
  };

  await hydrateAvailableSessions();
  prefillRegistrationFormFromProfile({
    firstNameInput,
    lastNameInput,
    emailInput,
    login42Input,
    profile: currentProfile,
    sessionUser: currentSession.user,
  });

  sessionSelect.addEventListener("change", () => {
    const nextSession =
      availableSessions.find((session) => String(session.id) === sessionSelect.value) ??
      availableSessions[0];

    activeSession = nextSession;
    updateSummary(activeSession);
  });

  formNode.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!activeSession) {
      stateBox.classList.remove("is-hidden");
      stateBox.innerHTML = renderRegistrationState(
        "Aucune session n’est actuellement sélectionnée.",
      );
      return;
    }

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const login42 = login42Input.value.trim();

    stateBox.classList.add("is-hidden");
    successBox.classList.add("is-hidden");
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";

    const { error } = await supabase.from("registrations").insert([
      {
        session_id: activeSession.id,
        user_id: currentSession.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        login_42: login42 || null,
        status: "registered",
      },
    ]);

    if (error) {
      stateBox.classList.remove("is-hidden");
      stateBox.innerHTML = renderRegistrationState(
        error.message || "L’inscription n’a pas pu être enregistrée.",
      );
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer la demande";
      return;
    }

    successBox.classList.remove("is-hidden");
    formNode.reset();
    prefillRegistrationFormFromProfile({
      firstNameInput,
      lastNameInput,
      emailInput,
      login42Input,
      profile: currentProfile,
      sessionUser: currentSession.user,
    });

    const previousSessionId = activeSession.id;
    const sessionsStillAvailable = await hydrateAvailableSessions(previousSessionId);

    if (!sessionsStillAvailable) {
      submitButton.disabled = true;
      submitButton.textContent = "Aucune session disponible";
      return;
    }

    submitButton.disabled = false;
    submitButton.textContent = "Envoyer la demande";
  });
}

async function hydrateModuleDetailSessions() {
  if (page !== "module-detail") {
    return;
  }

  const sessionsList = document.getElementById("module-sessions-list");

  if (!sessionsList) {
    return;
  }

  const moduleTitle = sessionsList.dataset.moduleTitle ?? "";
  const { data, error } = await fetchSessions();

  console.log("module sessions data:", data);
  console.log("module sessions error:", error);

  if (error) {
    sessionsList.innerHTML = renderModuleSessionsErrorState();
    return;
  }

  const matchingSessions = (data ?? [])
    .map(normalizeSession)
    .filter(
      (session) =>
        session.modules.some(
          (moduleName) =>
            String(moduleName).trim().toLowerCase() ===
            String(moduleTitle).trim().toLowerCase(),
        ) && (session.seatsRemaining === null || session.seatsRemaining > 0),
    );

  if (!matchingSessions.length) {
    sessionsList.innerHTML = renderModuleSessionsEmptyState();
    return;
  }

  sessionsList.innerHTML = matchingSessions.map(renderModuleSessionItem).join("");
}

async function hydrateSignupPage() {
  if (page !== "signup") {
    return;
  }

  const formNode = document.getElementById("user-signup-form");
  const displayNameInput = document.getElementById("signup-display-name");
  const login42Input = document.getElementById("signup-login-42");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const passwordConfirmationInput = document.getElementById(
    "signup-password-confirmation",
  );
  const submitButton = document.getElementById("user-signup-submit");
  const messageNode = document.getElementById("user-signup-message");

  if (
    !formNode ||
    !displayNameInput ||
    !login42Input ||
    !emailInput ||
    !passwordInput ||
    !passwordConfirmationInput ||
    !submitButton ||
    !messageNode
  ) {
    return;
  }

  const { session } = await getCurrentSupabaseSession();
  if (session) {
    window.location.href = getAuthRedirectTarget(routeMap.account);
    return;
  }

  formNode.addEventListener("submit", async (event) => {
    event.preventDefault();

    const displayName = displayNameInput.value.trim();
    const login42 = login42Input.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirmation = passwordConfirmationInput.value;

    if (password !== passwordConfirmation) {
      messageNode.dataset.state = "error";
      messageNode.textContent = "Les deux mots de passe doivent être identiques.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Création en cours...";
    messageNode.textContent = "";
    delete messageNode.dataset.state;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          login_42: login42 || null,
        },
      },
    });

    if (error) {
      messageNode.dataset.state = "error";
      messageNode.textContent = error.message || "Impossible de créer votre compte.";
      submitButton.disabled = false;
      submitButton.textContent = "Créer mon compte";
      return;
    }

    if (data.user?.id) {
      const profileResult = await saveUserProfileRecord(data.user.id, {
        email,
        displayName,
        login42,
      });

      if (profileResult.error) {
        if (data.session) {
          messageNode.dataset.state = "success";
          messageNode.textContent =
            "Compte créé. Quelques données de profil seront finalisées après redirection.";
          window.location.href = getAuthRedirectTarget(routeMap.account);
          return;
        }

        messageNode.dataset.state = "success";
        messageNode.textContent =
          "Compte créé. Vérifiez votre boîte mail puis connectez-vous pour finaliser votre profil.";
        submitButton.disabled = false;
        submitButton.textContent = "Créer mon compte";
        formNode.reset();
        return;
      }
    }

    if (data.session) {
      messageNode.dataset.state = "success";
      messageNode.textContent = "Compte créé. Redirection vers votre espace...";
      window.location.href = getAuthRedirectTarget(routeMap.account);
      return;
    }

    messageNode.dataset.state = "success";
    messageNode.textContent =
      "Compte créé. Vérifiez votre boîte mail si une confirmation est demandée, puis connectez-vous.";
    submitButton.disabled = false;
    submitButton.textContent = "Créer mon compte";
    formNode.reset();
  });
}

async function hydrateLoginPage() {
  if (page !== "login") {
    return;
  }

  const formNode = document.getElementById("user-login-form");
  const emailInput = document.getElementById("user-login-email");
  const passwordInput = document.getElementById("user-login-password");
  const submitButton = document.getElementById("user-login-submit");
  const messageNode = document.getElementById("user-login-message");

  if (!formNode || !emailInput || !passwordInput || !submitButton || !messageNode) {
    return;
  }

  const { session } = await getCurrentSupabaseSession();
  if (session) {
    window.location.href = getAuthRedirectTarget(routeMap.account);
    return;
  }

  formNode.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    submitButton.disabled = true;
    submitButton.textContent = "Connexion en cours...";
    messageNode.textContent = "";
    delete messageNode.dataset.state;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      messageNode.dataset.state = "error";
      messageNode.textContent = error.message || "Connexion impossible.";
      submitButton.disabled = false;
      submitButton.textContent = "Se connecter";
      return;
    }

    messageNode.dataset.state = "success";
    messageNode.textContent = "Connexion réussie. Redirection...";
    window.location.href = getAuthRedirectTarget(routeMap.account);
  });
}

async function hydrateUserDashboardPage() {
  if (page !== "account") {
    return;
  }

  const { session, error } = await getCurrentSupabaseSession();

  if (error) {
    content.innerHTML = renderUserDashboardErrorPage(
      "Votre session utilisateur n’a pas pu être vérifiée pour le moment.",
    );
    return;
  }

  if (!session) {
    window.location.href = buildLoginRedirectHref(routeMap.account);
    return;
  }

  const renderDashboard = async () => {
    const [
      summaryResult,
      profileResult,
      upcomingResult,
      calendarResult,
      completedResult,
      cancelledResult,
    ] = await Promise.all([
      supabase.from("my_user_dashboard_summary").select("*").maybeSingle(),
      fetchUserProfileRecord(session.user.id),
      supabase
        .from("my_upcoming_registrations")
        .select("*")
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true }),
      supabase
        .from("my_calendar_ready_sessions")
        .select("*")
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true }),
      supabase
        .from("my_completed_modules")
        .select("*")
        .order("session_date", { ascending: false }),
      supabase
        .from("my_registrations_with_sessions")
        .select("*")
        .eq("status", "cancelled")
        .order("session_date", { ascending: false }),
    ]);

    if (summaryResult.error && profileResult.error) {
      content.innerHTML = renderUserDashboardErrorPage(
        summaryResult.error?.message ||
          profileResult.error?.message ||
          "Impossible de charger votre espace pour le moment.",
      );
      return;
    }

    const calendarMap = new Map(
      (calendarResult.data ?? []).map((item) => [
        String(item.registration_id ?? item.id),
        item,
      ]),
    );

    const upcomingRegistrations = upcomingResult.error
      ? []
      : (upcomingResult.data ?? []).map((item) =>
          normalizeUpcomingRegistrationRecord(
            item,
            calendarMap.get(String(item.registration_id ?? item.id)),
          ),
        );

    const completedModules = completedResult.error
      ? []
      : (completedResult.data ?? []).map(normalizeCompletedModuleRecord);

    const cancelledRegistrations = cancelledResult.error
      ? []
      : (cancelledResult.data ?? [])
          .filter((item) => String(item.status).toLowerCase() === "cancelled")
          .map((item) => normalizeUpcomingRegistrationRecord(item, null));

    const summary = normalizeUserDashboardSummary(
      summaryResult.data,
      profileResult.data,
      session.user,
    );

    if (!summaryResult.data) {
      summary.upcomingRegistrationsCount = upcomingRegistrations.length;
      summary.completedModulesCount = completedModules.length;
    }

    content.innerHTML = renderUserDashboardPage(summary);

    const upcomingNode = document.getElementById("user-upcoming-registrations");
    const completedNode = document.getElementById("user-completed-modules");
    const cancelledNode = document.getElementById("user-cancelled-registrations");
    const cancelledSection = document.getElementById("user-cancelled-section");
    const dashboardMessageNode = document.getElementById("user-dashboard-message");
    const logoutButton = document.getElementById("user-logout-button");

    if (upcomingNode) {
      if (upcomingResult.error) {
        upcomingNode.innerHTML = renderUserStateCard(
          "Erreur",
          "Impossible de charger vos sessions à venir",
          upcomingResult.error.message || "Réessayez dans un instant.",
        );
      } else if (!upcomingRegistrations.length) {
        upcomingNode.innerHTML = renderUserStateCard(
          "Agenda",
          "Aucune session future",
          "Vous n’êtes inscrit à aucune session à venir pour le moment.",
        );
      } else {
        upcomingNode.innerHTML = upcomingRegistrations.map(renderUpcomingRegistrationCard).join("");
      }
    }

    if (completedNode) {
      if (completedResult.error) {
        completedNode.innerHTML = renderUserStateCard(
          "Erreur",
          "Impossible de charger vos modules passés",
          completedResult.error.message || "Réessayez dans un instant.",
        );
      } else if (!completedModules.length) {
        completedNode.innerHTML = renderUserStateCard(
          "Parcours",
          "Aucun module passé",
          "Vos modules déjà suivis apparaîtront ici une fois vos sessions terminées.",
        );
      } else {
        completedNode.innerHTML = completedModules.map(renderCompletedModuleCard).join("");
      }
    }

    if (cancelledSection && cancelledNode) {
      if (cancelledRegistrations.length) {
        cancelledSection.classList.remove("is-hidden");
        cancelledNode.innerHTML = cancelledRegistrations
          .map(renderCancelledRegistrationCard)
          .join("");
      } else {
        cancelledSection.classList.add("is-hidden");
        cancelledNode.innerHTML = "";
      }
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = "Déconnexion...";
        setAdminMessage(dashboardMessageNode);

        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
          setAdminMessage(
            dashboardMessageNode,
            "error",
            signOutError.message || "La déconnexion a échoué.",
          );
          logoutButton.disabled = false;
          logoutButton.textContent = "Se déconnecter";
          return;
        }

        window.location.href = routeMap.login;
      });
    }

    if (upcomingNode) {
      upcomingNode.addEventListener("click", async (event) => {
        const button = event.target.closest('[data-action="cancel-registration"][data-id]');

        if (!button) {
          return;
        }

        const registrationId = button.dataset.id;
        const targetRegistration = upcomingRegistrations.find(
          (item) => String(item.registrationId) === String(registrationId),
        );

        if (
          !targetRegistration ||
          !window.confirm(`Annuler l’inscription à ${targetRegistration.title} ?`)
        ) {
          return;
        }

        button.disabled = true;
        button.textContent = "Annulation...";
        setAdminMessage(dashboardMessageNode);

        const { error: updateError } = await supabase
          .from("registrations")
          .update({ status: "cancelled" })
          .eq("id", registrationId)
          .eq("user_id", session.user.id);

        if (updateError) {
          setAdminMessage(
            dashboardMessageNode,
            "error",
            updateError.message || "Impossible d’annuler cette inscription.",
          );
          button.disabled = false;
          button.textContent = "Annuler l’inscription";
          return;
        }

        setAdminMessage(
          dashboardMessageNode,
          "success",
          "Inscription annulée. Vos données sont en cours de mise à jour.",
        );
        await renderDashboard();
      });
    }
  };

  await renderDashboard();
}

async function hydrateAdminLoginPage() {
  if (page !== "admin-login") {
    return;
  }

  const formNode = document.getElementById("admin-login-form");
  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const messageNode = document.getElementById("admin-login-message");
  const submitButton = document.getElementById("admin-login-submit");

  if (!formNode || !emailInput || !passwordInput || !messageNode || !submitButton) {
    return;
  }

  formNode.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    submitButton.disabled = true;
    submitButton.textContent = "Connexion en cours...";
    messageNode.textContent = "";
    delete messageNode.dataset.state;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      messageNode.dataset.state = "error";
      messageNode.textContent = error.message || "Connexion impossible.";
      submitButton.disabled = false;
      submitButton.textContent = "Se connecter";
      return;
    }

    console.log("admin login data:", data);
    messageNode.dataset.state = "success";
    messageNode.textContent = "Connexion réussie. Redirection...";
    window.location.href = routeMap.admin;
  });
}

async function hydrateAdminPage() {
  if (page !== "admin") {
    return;
  }

  const { session, error } = await getCurrentSupabaseSession();

  console.log("admin session data:", session);
  console.log("admin session error:", error);

  if (error) {
    content.innerHTML = renderAdminErrorPage();
    return;
  }

  if (!session) {
    window.location.href = routeMap.adminLogin;
    return;
  }

  const { data: profile, error: profileError } = await fetchUserProfileRecord(session.user.id);

  console.log("admin profile data:", profile);
  console.log("admin profile error:", profileError);

  if (profileError) {
    content.innerHTML = renderAdminErrorPage();
    return;
  }

  if (profile?.role !== "admin") {
    content.innerHTML = renderAdminAccessDeniedPage();
    window.setTimeout(() => {
      window.location.href = routeMap.account;
    }, 1800);
    return;
  }

  const userEmail = session.user?.email ?? "Administrateur connecté";
  content.innerHTML = renderAdminPage(userEmail);
  cacheAdminDom();
  bindAdminDashboardInteractions();

  const logoutButton = document.getElementById("admin-logout-button");
  const logoutMessage = document.getElementById("admin-logout-message");

  if (logoutButton && logoutMessage) {
    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;
      logoutButton.textContent = "Déconnexion...";
      logoutMessage.textContent = "";
      delete logoutMessage.dataset.state;

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        logoutMessage.dataset.state = "error";
        logoutMessage.textContent =
          signOutError.message || "La déconnexion a échoué. Réessayez.";
        logoutButton.disabled = false;
        logoutButton.textContent = "Se déconnecter";
        return;
      }

      logoutMessage.dataset.state = "success";
      logoutMessage.textContent = "Déconnexion en cours...";
      window.location.href = routeMap.adminLogin;
    });
  }

  await initializeAdminDashboard();
}
