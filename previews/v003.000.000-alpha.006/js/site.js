/* ==========================================================================
   File: site.js
   DOYDL TECHNOLOGIES: MAIN HOMEPAGE JAVASCRIPT
   ==========================================================================
   Description:
     JavaScript logic and modal control for the DOYDL Technologies homepage.

   This file includes:
     1. Contact Form handler (Formspree)
     2. Modal open/close scripts for:
        - About (Profile)
        - Services (Tech)
        - Companies
        - Contact (Ping)
        - Legal/Terms (Privacy & Terms)
        - Disclaimer
     3. Hash-based modal navigation
     4. Responsive/modal accessibility handling

   --------------------------------------------------------------------------
   DEPENDENCIES:
     - index.html (markup)
     - style.css (for modal classes)
     - Bootstrap (for grid)
     - FontAwesome, ET Line Icon (icons)
     - jQuery (optionally, for legacy scripts)
   --------------------------------------------------------------------------
   NOTES:
     - All modal sections are handled with vanilla JS.
     - Hash navigation enables deep linking for each modal section.
     - Contact form submissions are AJAX to Formspree.
     - Version: v020.000.000
     - Last updated: 2026-05-26
========================================================================== */

// =========================
// Contact Form Handler
// =========================
document.querySelector('form[name="contactForm"]').addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the default form redirect

    const form = e.target;
    const data = new FormData(form);

    // Send the form data to Formspree
    const response = await fetch("https://formspree.io/f/xpwdlowg", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
    });

    if (response.ok) {
        alert("Thanks! Your message has been sent.");

        // Clear all form inputs
        form.reset();

        // Close the contact modal
        document.getElementById("contactModal").classList.remove("active");

        // Optionally, scroll back to top or to #home
        document.getElementById("home").scrollIntoView({ behavior: "smooth" });
    } else {
        alert("Oops! There was a problem. Please try again.");
    }
});

// =========================
// SERVICES Modal Script
// =========================
const servicesModal = document.getElementById("servicesModal");
const openServices = document.getElementById("openServices");
const closeServices = document.getElementById("closeServices");
openServices.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent link jump
    servicesModal.classList.add("active");
    window.location.hash = "Tech";
});

closeServices.addEventListener("click", function () {
    servicesModal.classList.remove("active");
    history.pushState("", document.title, window.location.pathname + window.location.search);
});

servicesModal.addEventListener("click", function (e) {
    if (e.target === servicesModal) {
        servicesModal.classList.remove("active");
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
});

// =========================
// CONTACT Modal Script
// =========================
const contactModal = document.getElementById("contactModal");
const openContact = document.getElementById("openContact");
const closeContact = document.getElementById("closeContact");

openContact.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent link jump
    contactModal.classList.add("active");
    window.location.hash = "Ping";
});

closeContact.addEventListener("click", function () {
    contactModal.classList.remove("active");
    history.pushState("", document.title, window.location.pathname + window.location.search);
});

contactModal.addEventListener("click", function (e) {
    if (e.target === contactModal) {
        contactModal.classList.remove("active");
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
});

// =========================
// ABOUT Modal Script
// =========================
const aboutModal = document.getElementById("aboutModal");
const openAbout = document.getElementById("openAbout");
const closeAbout = document.getElementById("closeAbout");

openAbout.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent link jump
    aboutModal.classList.add("active");
    window.location.hash = "Profile";
});

closeAbout.addEventListener("click", function () {
    aboutModal.classList.remove("active");
    history.pushState("", document.title, window.location.pathname + window.location.search);
});

aboutModal.addEventListener("click", function (e) {
    if (e.target === aboutModal) {
        aboutModal.classList.remove("active");
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
});

// =========================
// COMPANIES Modal Script
// =========================
const companiesModal = document.getElementById("companiesModal");
const openCompanies = document.getElementById("openCompanies");
const closeCompanies = document.getElementById("closeCompanies");

function closeCompaniesModal() {
    companiesModal.classList.remove("active");
    history.pushState("", document.title, window.location.pathname + window.location.search);
}

openCompanies.addEventListener("click", function (e) {
    e.preventDefault();
    companiesModal.classList.add("active");
    window.location.hash = "Companies";
});

closeCompanies.addEventListener("click", closeCompaniesModal);

companiesModal.addEventListener("click", function (e) {
    if (e.target === companiesModal) {
        closeCompaniesModal();
    }
});

// =========================
// Legal
// =========================
const judicialModal = document.getElementById("judicialModal");
const openJudicial = document.getElementById("openJudicial");
const closeJudicial = document.getElementById("closeJudicial");

openJudicial.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent link jump
    judicialModal.classList.add("active");
    window.location.hash = "Judicial"; 
});

closeJudicial.addEventListener("click", function () {
    judicialModal.classList.remove("active");
    history.pushState("", document.title, window.location.pathname + window.location.search);
});

judicialModal.addEventListener("click", function (e) {
    if (e.target === judicialModal) {
        judicialModal.classList.remove("active");
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
});

// Prevent in-modal anchor links from closing the modal
document.querySelectorAll("#judicialModal a[href^='#']").forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault(); // Stop hash from being added to URL

        const targetId = this.getAttribute("href").substring(1);
        const target = document.getElementById(targetId);

        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});


// =========================
// Disclaimer
// =========================
const disclaimerModal = document.getElementById("disclaimerModal");
const openDisclaimer = document.getElementById("openDisclaimer");
const closeDisclaimer = document.getElementById("closeDisclaimer");
openDisclaimer.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent link jump
    disclaimerModal.classList.add("active");
    window.location.hash = "Disclaimer"; 
});

closeDisclaimer.addEventListener("click", function () {
    disclaimerModal.classList.remove("active");
    history.pushState("", document.title, window.location.pathname + window.location.search);
});

disclaimerModal.addEventListener("click", function (e) {
    if (e.target === disclaimerModal) {
        disclaimerModal.classList.remove("active");
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
});

// Prevent in-modal anchor links from closing the modal
document.querySelectorAll("#disclaimerModal a[href^='#']").forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault(); 

        const targetId = this.getAttribute("href").substring(1);
        const target = document.getElementById(targetId);

        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// =========================
// Open Modals from URL Hash
// =========================
function openModalFromHash() {
    const hash = window.location.hash;

    // Close any open modals
    document.querySelectorAll('.custom-modal.active').forEach(modal => modal.classList.remove('active'));

    switch (hash) {
        case "#Profile":
            aboutModal.classList.add("active");
            break;
        case "#Companies":
            companiesModal.classList.add("active");
            break;
        case "#Tech":
            servicesModal.classList.add("active");
            break;
            
        case "#Ping":
            contactModal.classList.add("active");
            break;
        case "#Legal":
            judicialModal.classList.add("active");
            break;
        case "#Disclaimer":
            disclaimerModal.classList.add("active");
            break;            
        default:
            break;
    }
}

// On page load
window.addEventListener("load", openModalFromHash);

// Optional: React to back/forward navigation
window.addEventListener("hashchange", openModalFromHash);

// Update hash on link click (so URL changes)
openAbout.addEventListener("click", () => { window.location.hash = "Profile"; });
openCompanies.addEventListener("click", () => { window.location.hash = "Companies"; });
openServices.addEventListener("click", () => { window.location.hash = "Tech"; });
openContact.addEventListener("click", () => { window.location.hash = "Ping"; });
openJudicial.addEventListener("click", () => { window.location.hash = "Legal"; });
openDisclaimer.addEventListener("click", () => { window.location.hash = "Disclaimer"; });

// Close buttons also clear the hash
[closeAbout, closeCompanies, closeServices, closeContact, closeJudicial, closeDisclaimer].forEach(btn => {
    btn.addEventListener("click", () => {
        history.pushState("", document.title, window.location.pathname + window.location.search);
    });
});







