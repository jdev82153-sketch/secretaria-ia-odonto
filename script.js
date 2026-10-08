
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const menuButton = document.querySelector(".mobile-menu");
  const navLinks = document.querySelectorAll(".sidebar nav a");
  const pageTitle = document.querySelector(".page-heading h1");
  const pageSubtitle = document.querySelector(".page-heading p");

  // Navegação do menu
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || !targetId.startsWith("#")) return;

      const target = document.querySelector(targetId);

      if (!target) {
        event.preventDefault();
        showNotice("Esta área será construída nas próximas etapas.");
        return;
      }

      navLinks.forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");

      if (sidebar) sidebar.classList.remove("open");
    });
  });

  // Menu para celulares
  if (menuButton && sidebar) {
    menuButton.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Fecha o menu ao tocar fora dele
  document.addEventListener("click", (event) => {
    if (!sidebar || !menuButton) return;

    const clickedInsideSidebar = sidebar.contains(event.target);
    const clickedMenu = menuButton.contains(event.target);

    if (
      window.innerWidth <= 760 &&
      !clickedInsideSidebar &&
      !clickedMenu
    ) {
      sidebar.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });

  // Avisos demonstrativos
  function showNotice(message) {
    let notice = document.querySelector(".app-notice");

    if (!notice) {
      notice = document.createElement("div");
      notice.className = "app-notice";
      notice.setAttribute("role", "status");

      Object.assign(notice.style, {
        position: "fixed",
        right: "18px",
        bottom: "18px",
        zIndex: "100",
        maxWidth: "calc(100vw - 36px)",
        padding: "14px 18px",
        borderRadius: "12px",
        background: "#173d42",
        color: "#ffffff",
        boxShadow: "0 8px 30px rgba(0,0,0,.16)",
        fontSize: "13px",
        lineHeight: "1.5"
      });

      document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.hidden = false;
  }

  // Botões que ainda dependem de integrações
  document.querySelectorAll("[data-demo-action]").forEach((button) => {
    button.addEventListener("click", () => {
      showNotice(
        "Esta função ainda está em desenvolvimento. A integração será configurada nas próximas etapas."
      );
    });
  });

  // Exibe a data atual no painel, se existir um elemento apropriado
  const dateLabel = document.querySelector("[data-current-date]");

  if (dateLabel) {
    dateLabel.textContent = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date());
  }

  // Impede que formulários de demonstração recarreguem a página
  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      showNotice(
        "Formulário demonstrativo. O salvamento real será ativado posteriormente."
      );
    });
  });

  console.log("Secretária IA Odonto: painel carregado.");
});
