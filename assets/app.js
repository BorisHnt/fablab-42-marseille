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
};

renderShell();
renderPage();
bindInteractions();
runSupabaseEventsSmokeTest();

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
      content.innerHTML = renderAdminPage();
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
        <div class="card-grid three-columns">
          ${events.slice(0, 3).map(renderEventCard).join("")}
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

  const relatedSessions = sessions.filter((session) => session.moduleId === module.id);

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
          <div class="schedule-list">
            ${
              relatedSessions.length
                ? relatedSessions
                    .map(
                      (session) => `
                        <a class="schedule-item" href="${registrationLink(session.id)}">
                          <div>
                            <strong>${formatDate(session.date)}</strong>
                            <span>${session.time}</span>
                          </div>
                          <span>→</span>
                        </a>
                      `,
                    )
                    .join("")
                : `<div class="empty-state"><span>Les prochaines sessions seront affichées ici.</span></div>`
            }
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
        <div class="filter-row">
          <button class="filter-pill active" type="button" data-filter="all">Tous les modules</button>
          ${modules
            .map(
              (module) => `
                <button class="filter-pill" type="button" data-filter="${module.id}">
                  ${module.title}
                </button>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="card-grid two-columns" id="sessions-grid">
        ${sessions.map(renderSessionCard).join("")}
      </section>
    </div>
  `;
}

function renderRegistrationPage() {
  const sessionId = params.get("id");
  const session = sessions.find((item) => item.id === sessionId);

  if (!session) {
    document.title = "Inscription introuvable • Fablab 42 Marseille";
    return renderEmptyPage(
      "Inscription",
      "Session introuvable",
      "La session demandée n’existe pas ou n’est plus disponible.",
      routeMap.sessions,
      "Retour aux sessions",
    );
  }

  const module = modules.find((item) => item.id === session.moduleId);
  document.title = `Inscription • ${module.title} • Fablab 42 Marseille`;

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
              Nom complet
              <input type="text" placeholder="Prénom Nom" required />
            </label>
            <label>
              Adresse e-mail
              <input type="email" placeholder="vous@exemple.fr" required />
            </label>
            <label>
              Niveau ou contexte
              <input type="text" placeholder="Débutant, étudiant, curiosité personnelle..." />
            </label>
            <label>
              Message
              <textarea rows="5" placeholder="Dites-nous en une phrase ce qui vous motive pour cette session."></textarea>
            </label>
            <button class="button button-primary" type="submit">Envoyer la demande</button>
          </form>

          <div class="success-box is-hidden" id="registration-success">
            <div>
              <strong>Votre demande a été enregistrée.</strong>
              <p>
                Cette page peut ensuite être reliée à une confirmation e-mail, un suivi des places
                restantes ou une liste d’attente.
              </p>
            </div>
          </div>
        </div>

        <aside class="registration-summary">
          <article class="info-card animate-rise">
            <span class="category-badge">Session sélectionnée</span>
            <h3>${module.title}</h3>
            <div class="inline-detail">${formatDate(session.date)} · ${session.time}</div>
            <p>${module.presentation}</p>
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

      <section class="section-card supabase-test-card animate-rise">
        <div class="section-heading">
          <span class="eyebrow">Test Supabase</span>
          <h2>Connexion events</h2>
          <p>Bloc temporaire pour valider la lecture frontend de la table <code>events</code>.</p>
        </div>
        <div class="supabase-test-status" id="supabase-events-status">Chargement des événements...</div>
        <pre class="supabase-test-output" id="supabase-events-output">En attente de la réponse Supabase...</pre>
      </section>

      <section class="card-grid two-columns">
        ${events.map(renderEventCard).join("")}
      </section>
    </div>
  `;
}

function renderAdminPage() {
  return `
    <div class="page-flow">
      <section class="page-hero animate-rise">
        ${sectionHeading(
          "Admin",
          "Structure interne prête à évoluer",
          "Même sans backend branché, l’architecture admin existe déjà pour préparer la gestion du matériel et les besoins du fablab.",
        )}
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
  return `
    <article class="info-card event-card animate-rise">
      <span class="category-badge">${event.category}</span>
      <h3>${event.title}</h3>
      <div class="inline-detail">${formatDate(event.date)}</div>
      <p>${event.description}</p>
    </article>
  `;
}

function renderSessionCard(session) {
  const module = modules.find((item) => item.id === session.moduleId);

  return `
    <article class="info-card session-card animate-rise" data-module-id="${session.moduleId}">
      <div class="session-head">
        <span class="category-badge">${session.label}</span>
        <span class="subtle-badge">${session.level}</span>
      </div>
      <h3>${module.title}</h3>
      <div class="session-meta">
        <div class="inline-detail">${formatDate(session.date)} · ${session.time}</div>
        <div class="inline-detail">${session.location}</div>
        <div class="inline-detail">${session.seats} places</div>
      </div>
      <a class="button button-primary button-block" href="${registrationLink(session.id)}">S’inscrire</a>
    </article>
  `;
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
  return `inscription.html?id=${sessionId}`;
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

function bindInteractions() {
  const menuButton = document.querySelector(".menu-toggle");
  const navPanel = document.querySelector(".nav-panel");

  if (menuButton && navPanel) {
    menuButton.addEventListener("click", () => {
      const isOpen = navPanel.classList.toggle("nav-panel-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (page === "sessions") {
    const pills = Array.from(document.querySelectorAll("[data-filter]"));
    const cards = Array.from(document.querySelectorAll("[data-module-id]"));

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const filter = pill.dataset.filter;

        pills.forEach((item) => item.classList.remove("active"));
        pill.classList.add("active");

        cards.forEach((card) => {
          const shouldShow =
            filter === "all" || card.dataset.moduleId === filter;
          card.classList.toggle("is-hidden", !shouldShow);
        });
      });
    });
  }

  const signupForm = document.querySelector("[data-mock-registration]");
  const successBox = document.getElementById("registration-success");

  if (signupForm && successBox) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      signupForm.classList.add("is-hidden");
      successBox.classList.remove("is-hidden");
    });
  }
}

async function runSupabaseEventsSmokeTest() {
  if (page !== "events") {
    return;
  }

  const statusNode = document.getElementById("supabase-events-status");
  const outputNode = document.getElementById("supabase-events-output");

  if (!statusNode || !outputNode) {
    return;
  }

  statusNode.textContent = "Chargement des événements depuis Supabase...";

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  console.log("events data:", data);
  console.log("events error:", error);

  if (error) {
    statusNode.textContent = `Erreur Supabase : ${error.message}`;
    statusNode.dataset.state = "error";
    outputNode.textContent = JSON.stringify(error, null, 2);
    return;
  }

  statusNode.textContent = `${data.length} événement(s) récupéré(s) depuis Supabase.`;
  statusNode.dataset.state = "success";
  outputNode.textContent = JSON.stringify(data, null, 2);
}
