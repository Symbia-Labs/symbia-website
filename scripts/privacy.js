(function () {
  const GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || null;
  const CONSENT_KEY = "symbia-analytics-consent";
  const banner = document.getElementById("privacy-banner");
  const acceptBtn = document.getElementById("privacy-accept");
  const declineBtn = document.getElementById("privacy-decline");

  function loadGA() {
    if (!GA_MEASUREMENT_ID) return;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function showBanner() {
    if (banner) banner.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === "accepted") {
      loadGA();
      hideBanner();
      return;
    }
    if (consent === "declined") {
      hideBanner();
      return;
    }
    showBanner();
  });

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "accepted");
      hideBanner();
      loadGA();
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "declined");
      hideBanner();
    });
  }
})();
