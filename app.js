const evidence = [
  {
    status: "documented",
    label: "Motsägande dokument",
    title: "Rubrikcitatets innebörd motsägs av originalljudet",
    claim: "Originalljudet visar att uttrycket avsåg risken att Borås Tidning skulle missförstå verksamheten, inte kunderna.",
    source: "Oklippt intervju 16 november 2022, 01:10:32–01:10:46.",
    conclusion: "Rubriken gav läsaren en annan innebörd än den som framgår av det fullständiga uttalandet."
  },
  {
    status: "disputed",
    label: "Publicerad uppgift",
    title: "Den kritiska bilden knöts direkt till William",
    claim: "Namn, bild, vd-roll och det omstridda citatet gjorde William till personlig bärare av artikelseriens huvudpåstående.",
    source: "Den fullständiga publiceringens rubrik, bild, bildtext och brödtext.",
    conclusion: "Läsaren gavs en personifierad bild som inte återgav den dokumenterade ansvarskedjan."
  },
  {
    status: "documented",
    label: "Motsägande dokument",
    title: "BankID-avtalen visar vad kunden köpte",
    claim: "Individuella avtal knöt fakturering till topp-10-prestation på Google.",
    source: "Avtal med bland andra Salong Aladyn och Mimos Candles.",
    conclusion: "Kunderna beställde en beskriven prestationsbaserad tjänst och signerade villkoren med BankID."
  },
  {
    status: "documented",
    label: "Motsägande dokument",
    title: "Fakturorna skapades utifrån faktisk prestation",
    claim: "Fem fakturaexempel specificerar sökfras, prestationsdatum, pris per dag och eRocket-sida.",
    source: "Prestationsbaserad faktura, exempel 1–5.",
    conclusion: "Faktureringen följde den modell William förklarade för reportern Matilda Spetz."
  },
  {
    status: "corroborated",
    label: "Ansvarskedjan",
    title: "En extern aktör skötte den tidiga försäljningen",
    claim: "Betalda provisionsfakturor dokumenterar en verklig och ekonomiskt central extern säljkedja.",
    source: "Betalda provisionsfakturor 61, 63, 70 och 71 samt samtida samarbetsutkast.",
    conclusion: "Försäljningsproblemen kan inte rättvisande beskrivas utan den externa aktörens dokumenterade roll."
  },
  {
    status: "corroborated",
    label: "Leveransbevis",
    title: "eRocket var en verklig produkt som levererade",
    claim: "Kundportal, kampanjer, sökord och rankingdata visar faktisk produktion och mätbara resultat.",
    source: "Bevarad dashboard, produktmaterial och Google-data.",
    conclusion: "Den dokumenterade produkten och dess registrerade prestationer behöver vägas in i bedömningen av artikelseriens bild."
  },
  {
    status: "disputed",
    label: "Publicerad uppgift",
    title: "Redaktionen informerades om risken för en felaktig bild",
    claim: "William sade före publicering att ett missförstånd skulle kunna skada både hans namn och verksamheten.",
    source: "Oklippt intervju, 00:48:02–00:48:54 och 01:56:57–01:57:13.",
    conclusion: "Publiceringen skedde efter att redaktionen hade fått både motuppgifter och en uttrycklig skadevarning."
  },
  {
    status: "corroborated",
    label: "Ansvarstagande",
    title: "William agerade när försäljningsproblem upptäcktes",
    claim: "William redovisade intern kontroll, kundkontakt, avslutat samarbete och personalåtgärder för reportern Matilda Spetz.",
    source: "Flera tidskodade intervjuavsnitt och e-postkorrespondens.",
    conclusion: "Agerandet behöver vägas in vid bedömningen av om artikelseriens helhetsbild var rättvisande."
  },
  {
    status: "corroborated",
    label: "Verklig verksamhet",
    title: "Fungerande kommersiell verksamhet före publicering",
    claim: "Rapporter visar faktisk omsättning, personal och positivt beräknat resultat.",
    source: "Resultat- och balansrapporter utskrivna 31 oktober 2022.",
    conclusion: "Underlagen visar en fungerande verksamhet med anställda, intäkter och kundfordringar."
  },
  {
    status: "open",
    label: "Skadan",
    title: "eRocket hade ett dokumenterat mångmiljonvärde",
    claim: "En daterad rapport anger ett värdeintervall om 39,6–48,4 miljoner kronor före konkurserna.",
    source: "Värderingsrapport daterad 18 januari 2024.",
    conclusion: "Underlaget visar att det fanns en värderad kommersiell tillgång."
  },
  {
    status: "disputed",
    label: "Publicerad uppgift",
    title: "Huvudpåståendet presenterades utan att helheten redovisades",
    claim: "Rubriken presenterade påståendet om vilseledning som ett redaktionellt konstaterande trots det omfattande motunderlaget.",
    source: "Rubriken, artikelns helhetsintryck och materialet redaktionen hade före publicering.",
    conclusion: "Läsare utan egen kännedom fick en bild som motsägs av den samlade dokumentationen."
  },
  {
    status: "open",
    label: "Skadan",
    title: "Efter rapporteringen förändrades Williams yrkesliv",
    claim: "Inkomstfall, förlorade uppdrag, fortsatt spridning och konkurser dokumenterar efterförloppet.",
    source: "Inkomstuppgifter, konkursunderlag, rättelsemejl och dokumenterade spridningshändelser.",
    conclusion: "Artikelseriens bild följde William till kunder, uppdrag och framtida möjligheter."
  }
];

const statusClass = {
  documented: "documented",
  corroborated: "corroborated",
  disputed: "disputed",
  open: "open"
};

function renderEvidence(filter = "all") {
  const grid = document.querySelector("#evidenceGrid");
  if (!grid) return;
  grid.innerHTML = evidence.map((item) => `
    <article class="evidence-card ${filter !== "all" && filter !== item.status ? "hidden" : ""}" data-status="${item.status}">
      <span class="status ${statusClass[item.status]}">${item.label}</span>
      <h3>${item.title}</h3>
      <p>${item.claim}</p>
      <dl>
        <dt>Källa</dt>
        <dd>${item.source}</dd>
        <dt>Slutsats</dt>
        <dd>${item.conclusion}</dd>
      </dl>
    </article>
  `).join("");
}

renderEvidence();

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderEvidence(button.dataset.filter);
  });
});

document.querySelectorAll(".evidence-jump").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.target)?.scrollIntoView({ behavior: "smooth" });
  });
});

const menuButton = document.querySelector("#menuButton");
const siteNav = document.querySelector("#siteNav");
if (menuButton && siteNav) {
  const closedMenuLabel = menuButton.textContent.trim() || "Meny";
  const setNavOpen = (open) => {
    siteNav.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "Stäng" : closedMenuLabel;
    document.body.classList.toggle("nav-open", open);
    if (open) document.body.classList.remove("mobile-nav-hidden");
  };

  menuButton.addEventListener("click", () => {
    setNavOpen(!siteNav.classList.contains("open"));
  });
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setNavOpen(false);
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });

  const mobileNavQuery = window.matchMedia("(max-width: 720px)");
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  const updateMobileNavOnScroll = () => {
    const currentScrollY = Math.max(0, window.scrollY);
    const delta = currentScrollY - lastScrollY;
    const isMobile = mobileNavQuery.matches;
    const isOpen = document.body.classList.contains("nav-open");

    document.body.classList.toggle("mobile-nav-scrolled", isMobile && currentScrollY > 14);

    if (!isMobile || isOpen || currentScrollY < 28) {
      document.body.classList.remove("mobile-nav-hidden");
      lastScrollY = currentScrollY;
      scrollTicking = false;
      return;
    }

    if (delta > 8 && currentScrollY > 118) {
      document.body.classList.add("mobile-nav-hidden");
    } else if (delta < -6) {
      document.body.classList.remove("mobile-nav-hidden");
    }

    lastScrollY = currentScrollY;
    scrollTicking = false;
  };

  const requestMobileNavUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateMobileNavOnScroll);
  };

  window.addEventListener("scroll", requestMobileNavUpdate, { passive: true });
  mobileNavQuery.addEventListener("change", () => {
    lastScrollY = window.scrollY;
    document.body.classList.remove("mobile-nav-hidden");
    document.body.classList.toggle("mobile-nav-scrolled", mobileNavQuery.matches && window.scrollY > 14);
  });
  updateMobileNavOnScroll();
}

const interviewSource = "media/intervju-bt-2022-11-16-oklippt.m4a";
const interviewPositionKey = "wr-bt-interview-position";

function ensureInterviewPlayer() {
  if (document.querySelector("#globalInterviewPlayer")) return;

  const player = document.createElement("aside");
  player.id = "globalInterviewPlayer";
  player.className = "sticky-interview-player";
  player.setAttribute("aria-label", "Fast spelare för BT-intervjun");
  player.innerHTML = `
    <div class="sticky-interview-copy">
      <span>Originalljudet</span>
      <strong>BT-intervjun 16 november 2022</strong>
      <small>Lyssna medan du granskar bevisningen.</small>
    </div>
    <audio id="globalInterviewAudio" data-interview-audio controls preload="metadata" src="${interviewSource}"></audio>
    <div class="sticky-interview-links">
      <a href="artiklar.html#intervjutidskoder">Tidskoder</a>
      <a href="bevis/transkript-intervju-bt-2022-11-16-oklippt.md">Transkript</a>
    </div>
  `;
  document.body.appendChild(player);
  document.body.classList.add("has-sticky-player");
}

function getInterviewAudios() {
  return [...document.querySelectorAll("[data-interview-audio], #btInterviewAudio")];
}

function setupInterviewAudio() {
  ensureInterviewPlayer();
  const pageAudio = document.querySelector("#btInterviewAudio");
  if (pageAudio) pageAudio.setAttribute("data-interview-audio", "page");

  const audios = getInterviewAudios();
  const savedPosition = Number(localStorage.getItem(interviewPositionKey) || 0);

  audios.forEach((audio) => {
    audio.addEventListener("loadedmetadata", () => {
      if (savedPosition > 0 && savedPosition < audio.duration - 3 && audio.currentTime < 1) {
        audio.currentTime = savedPosition;
      }
    }, { once: true });

    audio.addEventListener("play", () => {
      audios.forEach((otherAudio) => {
        if (otherAudio !== audio) otherAudio.pause();
      });
    });

    audio.addEventListener("timeupdate", () => {
      if (Number.isFinite(audio.currentTime)) {
        localStorage.setItem(interviewPositionKey, String(Math.floor(audio.currentTime)));
      }
    });
  });

  document.querySelectorAll(".time-jump").forEach((button) => {
    button.addEventListener("click", async () => {
      const targetTime = Number(button.dataset.time);
      const audio = document.querySelector("#globalInterviewAudio") || document.querySelector("#btInterviewAudio");
      if (!audio || !Number.isFinite(targetTime)) return;
      document.querySelectorAll(".time-jump").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const seekAndPlay = async () => {
        getInterviewAudios().forEach((item) => {
          item.currentTime = targetTime;
          if (item !== audio) item.pause();
        });
        audio.currentTime = targetTime;
        try {
          await audio.play();
        } catch (error) {
          audio.focus();
        }
      };

      if (audio.readyState >= 1) {
        await seekAndPlay();
      } else {
        audio.preload = "auto";
        audio.load();
        audio.addEventListener("loadedmetadata", seekAndPlay, { once: true });
      }
    });
  });
}

setupInterviewAudio();

function setupStickyPlayerBehavior() {
  const player = document.querySelector("#globalInterviewPlayer");
  if (!player) return;

  let compactTicking = false;
  let expandedUntil = 0;

  const expandTemporarily = () => {
    expandedUntil = Date.now() + 4200;
    document.body.classList.remove("media-player-compact");
  };

  const updatePlayerMode = () => {
    const shouldCompact =
      window.scrollY > 150 &&
      !document.body.classList.contains("nav-open") &&
      Date.now() > expandedUntil;

    document.body.classList.toggle("media-player-compact", shouldCompact);
    compactTicking = false;
  };

  const requestPlayerModeUpdate = () => {
    if (compactTicking) return;
    compactTicking = true;
    window.requestAnimationFrame(updatePlayerMode);
  };

  ["pointerdown", "focusin", "mouseenter"].forEach((eventName) => {
    player.addEventListener(eventName, expandTemporarily);
  });

  window.addEventListener("scroll", requestPlayerModeUpdate, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") document.body.classList.remove("media-player-compact");
  });
  updatePlayerMode();
}

setupStickyPlayerBehavior();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const progress = document.querySelector("#readingProgress");
window.addEventListener("scroll", () => {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${height > 0 ? (window.scrollY / height) * 100 : 0}%`;
}, { passive: true });

const timelineCompassLinks = [...document.querySelectorAll(".timeline-compass a[href^='#']")];
if (timelineCompassLinks.length) {
  const sectionMap = new Map(
    timelineCompassLinks
      .map((link) => [link.getAttribute("href").slice(1), link])
      .filter(([id]) => document.getElementById(id))
  );
  const setActiveTimelineSection = (id) => {
    timelineCompassLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
  };
  setActiveTimelineSection(timelineCompassLinks[0].getAttribute("href").slice(1));
  const timelineObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveTimelineSection(visible.target.id);
  }, { rootMargin: "-35% 0px -45% 0px", threshold: [0.12, 0.35, 0.6] });
  sectionMap.forEach((_, id) => timelineObserver.observe(document.getElementById(id)));
}
