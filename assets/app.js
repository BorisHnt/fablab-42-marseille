import {
  events,
  highlights,
  inventory,
  materialNeeds,
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
  admin: "admin.html",
  adminLogin: "admin-login.html",
};

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
  "admin-login": "admin",
};

renderShell();
renderPage();
bindInteractions();
hydrateEventsPage();
hydrateHomeEventsSection();
hydrateSessionsPage();
hydrateRegistrationPage();
hydrateModuleDetailSessions();
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
        <a class="button button-secondary nav-cta" href="${routeMap.sessions}">Voir les sessions</a>
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

function renderAdminPage(userEmail = "") {
  return `
    <div class="page-flow">
      <section class="page-hero animate-rise">
        ${sectionHeading(
          "Admin",
          "Structure interne prête à évoluer",
          "Même sans backend branché, l’architecture admin existe déjà pour préparer la gestion du matériel et les besoins du fablab.",
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
          <strong>${inventory.length} lignes d’inventaire</strong>
          <span>Une première vue pour organiser le matériel disponible.</span>
        </article>
        <article class="metric-card animate-rise">
          <strong>${materialNeeds.length} besoins recensés</strong>
          <span>Une base claire pour les achats et les demandes à venir.</span>
        </article>
        <article class="metric-card animate-rise">
          <strong>Lecture immédiate</strong>
          <span>Des tableaux propres et crédibles, faciles à enrichir ensuite.</span>
        </article>
      </section>

      <section class="section-card animate-rise">
        ${sectionHeading(
          "Inventaire",
          "Matériel disponible",
          "Une première vue de l’inventaire pour imaginer la gestion du stock au quotidien.",
        )}
        ${renderTable(
          [
            "Nom du matériel",
            "Catégorie",
            "Quantité",
            "État",
            "Emplacement",
          ],
          inventory.map((item) => [
            item.name,
            item.category,
            item.quantity,
            item.condition,
            item.location,
          ]),
        )}
      </section>

      <section class="section-card section-card-soft animate-rise">
        ${sectionHeading(
          "Besoins",
          "Matériel nécessaire",
          "Une zone pour visualiser ce qu’il faut acquérir, documenter ou faire financer.",
        )}
        ${renderTable(
          ["Matériel souhaité", "Quantité voulue", "Priorité", "Statut"],
          materialNeeds.map((item) => [
            item.name,
            item.wanted,
            item.priority,
            item.status,
          ]),
        )}
      </section>
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

  const { data, error } = await supabase.auth.getSession();
  const session = data?.session ?? null;

  console.log("admin session data:", data);
  console.log("admin session error:", error);

  if (error) {
    content.innerHTML = renderAdminErrorPage();
    return;
  }

  if (!session) {
    window.location.href = routeMap.adminLogin;
    return;
  }

  const userEmail = session.user?.email ?? "Administrateur connecté";
  content.innerHTML = renderAdminPage(userEmail);

  const logoutButton = document.getElementById("admin-logout-button");
  const logoutMessage = document.getElementById("admin-logout-message");

  if (!logoutButton || !logoutMessage) {
    return;
  }

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
