
document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const originalChats = [
    {
      id: 1, name: "Mariana Costa", initials: "MC", color: "",
      time: "09:42", status: "pendente", ai: true, unread: 2,
      messages: [
        { from: "them", text: "Olá! Gostaria de saber como funciona a primeira consulta.", time: "09:40" },
        { from: "them", text: "Vocês atendem de manhã?", time: "09:42" }
      ]
    },
    {
      id: 2, name: "Rafael Souza", initials: "RS", color: "blue",
      time: "09:18", status: "resolvida", ai: false, unread: 0,
      messages: [
        { from: "them", text: "Olá, gostaria de informações sobre limpeza dental.", time: "09:15" },
        { from: "us", text: "Olá! A equipe poderá explicar as opções de atendimento e os valores após entender sua necessidade.", time: "09:18" }
      ]
    },
    {
      id: 3, name: "Ana Lima", initials: "AL", color: "peach",
      time: "08:56", status: "pendente", ai: true, unread: 1,
      messages: [
        { from: "them", text: "Quero verificar os horários disponíveis para uma consulta.", time: "08:56" }
      ]
    }
  ];

  const originalAppointments = [
    { name: "Mariana Costa", service: "Avaliação inicial", date: "A confirmar", time: "A confirmar", status: "Pendente" },
    { name: "Rafael Souza", service: "Informações sobre limpeza", date: "A confirmar", time: "A confirmar", status: "Pendente" },
    { name: "Ana Lima", service: "Consulta", date: "A confirmar", time: "A confirmar", status: "Pendente" },
    { name: "Pedro Alves", service: "Retorno", date: "Exemplo", time: "Exemplo", status: "Demonstrativo" }
  ];

  let chats = copyChats(originalChats);
  let appointments = originalAppointments.map(item => ({ ...item }));
  let selectedId = 1;
  let activeFilter = "todas";
  let nextId = 4;
  let toastTimer;

  function copyChats(list) {
    return list.map(chat => ({
      ...chat,
      messages: chat.messages.map(message => ({ ...message }))
    }));
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  function getSelectedChat() {
    return chats.find(chat => chat.id === selectedId);
  }

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2)
      .map(part => part[0] || "").join("").toUpperCase();
  }

  function currentTime() {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
  }

  function renderChatList() {
    const list = $("#chat-list");
    const query = ($("#chat-search")?.value || "").trim().toLowerCase();

    const filtered = chats.filter(chat => {
      const matchesQuery =
        chat.name.toLowerCase().includes(query) ||
        chat.messages.some(message => message.text.toLowerCase().includes(query));

      const matchesFilter =
        activeFilter === "todas" ||
        (activeFilter === "pendentes" && chat.status === "pendente") ||
        (activeFilter === "ia" && chat.ai);

      return matchesQuery && matchesFilter;
    });

    list.innerHTML = filtered.map(chat => {
      const lastMessage = chat.messages[chat.messages.length - 1];
      const preview = lastMessage ? lastMessage.text : "Nenhuma mensagem ainda";

      return `
        <button class="chat-item ${chat.id === selectedId ? "active" : ""}"
          data-chat-id="${chat.id}" type="button">
          <span class="contact-avatar ${escapeHTML(chat.color)}">
            ${escapeHTML(chat.initials)}
          </span>
          <span class="chat-item-main">
            <span class="chat-item-top">
              <strong>${escapeHTML(chat.name)}</strong>
              <span class="chat-time">${escapeHTML(chat.time)}</span>
            </span>
            <span class="chat-preview">${escapeHTML(preview)}</span>
            <span class="chat-item-bottom">
              <span class="mini-status ${chat.ai ? "ai" : ""}">
                ${chat.ai ? "✳ IA ativada" : chat.status === "resolvida" ? "Resolvida" : "Equipe"}
              </span>
              ${chat.unread ? `<span class="unread">${chat.unread}</span>` : ""}
            </span>
          </span>
        </button>
      `;
    }).join("");

    $("#empty-list").classList.toggle("hidden", filtered.length !== 0);
    $("#chat-total").textContent =
      `${chats.length} conversa${chats.length === 1 ? "" : "s"} de demonstração`;

    $$(".chat-item").forEach(button => {
      button.addEventListener("click", () => {
        selectedId = Number(button.dataset.chatId);
        const chat = getSelectedChat();
        if (chat) chat.unread = 0;
        renderChatList();
        renderMessages();
      });
    });

    $("#stat-conversations").textContent = chats.length;
    $("#stat-pending").textContent =
      chats.filter(chat => chat.status === "pendente").length;
  }

  function renderMessages() {
    const chat = getSelectedChat();

    $("#chat-empty").classList.toggle("hidden", Boolean(chat));
    $("#chat-active").classList.toggle("hidden", !chat);

    if (!chat) return;

    $("#contact-name").textContent = chat.name;
    $("#contact-avatar").textContent = chat.initials;
    $("#contact-avatar").className = `contact-avatar ${chat.color}`;
    $("#contact-status").textContent =
      chat.status === "resolvida" ? "Conversa marcada como resolvida" :
      "Contato fictício · Modo demonstração";

    $("#toggle-ai").textContent = chat.ai ? "✳ Desativar IA" : "✳ Ativar IA";
    $("#toggle-ai").classList.toggle("button-primary", chat.ai);
    $("#toggle-ai").classList.toggle("button-secondary", !chat.ai);

    const messageList = $("#message-list");

    messageList.innerHTML = `
      <div class="message-date">Hoje · conversa simulada</div>
      ${chat.messages.map(message => `
        <div class="message ${message.from === "us" ? "outgoing" : ""}">
          <div class="message-text">${escapeHTML(message.text)}</div>
          <div class="message-meta">
            ${escapeHTML(message.time)}
            ${message.from === "us" ? "✓✓" : ""}
          </div>
        </div>
      `).join("")}
    `;

    messageList.scrollTop = messageList.scrollHeight;
  }

  function addMessage(chat, from, text) {
    chat.messages.push({
      from,
      text,
      time: currentTime()
    });
    chat.time = currentTime();
  }

  function simulateAIResponse(text) {
    const message = text.toLowerCase();

    if (/preço|preço|valor|custa|quanto/.test(message)) {
      return "Os valores dependem do serviço e da avaliação da equipe. Posso encaminhar sua dúvida para a clínica confirmar as informações.";
    }

    if (/horário|horarios|horários|manhã|manha|tarde|abre|fecha/.test(message)) {
      return "Os horários de atendimento precisam ser confirmados com a equipe da clínica. Gostaria de deixar uma solicitação para verificarem a disponibilidade?";
    }

    if (/agend|consulta|marcar|horário disponível/.test(message)) {
      return "Claro! Posso registrar seu pedido de agendamento para a equipe verificar os horários disponíveis. Qual período costuma ser melhor para você?";
    }

    if (/dor|doendo|urgente|inchad|sangr/.test(message)) {
      return "Sinto muito que esteja passando por isso. Vou encaminhar sua mensagem para a equipe da clínica avaliar a situação. Se for uma emergência ou os sintomas forem intensos, procure atendimento de urgência.";
    }

    if (/limpeza|clareamento|implante|aparelho|canal/.test(message)) {
      return "A clínica poderá orientar você sobre esse procedimento e verificar a necessidade de uma avaliação. Deseja que a equipe entre em contato?";
    }

    return "Olá! Obrigado por entrar em contato com a clínica. Posso ajudar com informações gerais ou encaminhar sua solicitação para nossa equipe. O que você gostaria de saber?";
  }

  function sendMessage(text, from = "us") {
    const chat = getSelectedChat();
    const cleanText = text.trim();

    if (!chat || !cleanText) return false;

    if (cleanText.length > 1000) {
      showToast("A mensagem ultrapassa o limite de 1.000 caracteres.");
      return false;
    }

    addMessage(chat, from, cleanText);
    chat.status = "pendente";
    renderChatList();
    renderMessages();
    return true;
  }

  $("#message-form").addEventListener("submit", event => {
    event.preventDefault();

    const input = $("#message-input");
    const text = input.value.trim();

    if (!text) {
      showToast("Escreva uma mensagem primeiro.");
      return;
    }

    const chat = getSelectedChat();
    if (!chat) {
      showToast("Selecione uma conversa.");
      return;
    }

    const aiWasActive = chat.ai;
    sendMessage(text);
    input.value = "";
    $("#character-count").textContent = "0/1000";
    input.style.height = "auto";

    if (aiWasActive) {
      setTimeout(() => {
        const currentChat = chats.find(item => item.id === selectedId);
        if (!currentChat || !currentChat.ai) return;

        addMessage(currentChat, "them", simulateAIResponse(text));
        renderChatList();
        renderMessages();
      }, 700);
    }
  });

  $("#message-input").addEventListener("input", event => {
    $("#character-count").textContent = `${event.target.value.length}/1000`;
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 110)}px`;
  });

  $("#message-input").addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      $("#message-form").requestSubmit();
    }
  });

  $("#quick-replies").addEventListener("click", event => {
    const button = event.target.closest("[data-reply]");
    if (!button) return;

    $("#message-input").value = button.dataset.reply;
    $("#message-input").dispatchEvent(new Event("input"));
    $("#message-input").focus();
  });

  $("#toggle-ai").addEventListener("click", () => {
    const chat = getSelectedChat();
    if (!chat) return;

    chat.ai = !chat.ai;
    renderChatList();
    renderMessages();

    showToast(chat.ai
      ? "Respostas automáticas simuladas ativadas."
      : "Respostas automáticas simuladas desativadas.");
  });

  $("#close-chat").addEventListener("click", () => {
    const chat = getSelectedChat();
    if (!chat) return;

    chat.status = chat.status === "resolvida" ? "pendente" : "resolvida";
    renderChatList();
    renderMessages();

    showToast(chat.status === "resolvida"
      ? "Conversa marcada como resolvida."
      : "Conversa reaberta.");
  });

  $("#chat-search").addEventListener("input", renderChatList);

  $$(".filter-button").forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      $$(".filter-button").forEach(item =>
        item.classList.toggle("active", item === button)
      );
      renderChatList();
    });
  });

  function navigate(pageName) {
    const validPages = [
      "dashboard", "conversas", "agendamentos", "pacientes",
      "assistente", "relatorios", "configuracoes"
    ];

    if (!validPages.includes(pageName)) return;

    $$(".page").forEach(page => {
      page.classList.toggle("active", page.id === `page-${pageName}`);
    });

    $$(".nav-link").forEach(link => {
      link.classList.toggle("active", link.dataset.page === pageName);
    });

    const activeLink = $(`.nav-link[data-page="${pageName}"]`);
    $("#page-title").textContent = activeLink
      ? activeLink.textContent.replace(/[▦◉♙✳▤⚙]/g, "").trim()
      : pageName;

    $("#breadcrumb").textContent = pageName.toUpperCase();
    $("#sidebar").classList.remove("open");
    window.location.hash = pageName;

    if (pageName === "agendamentos") renderAppointments();
    if (pageName === "pacientes") renderPatients();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $$(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      navigate(link.dataset.page);
    });
  });

  $$("[data-go]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.go));
  });

  $("#menu-toggle").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
  });

  document.addEventListener("click", event => {
    const sidebar = $("#sidebar");
    if (window.innerWidth <= 760 &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        !$("#menu-toggle").contains(event.target)) {
      sidebar.classList.remove("open");
    }
  });

  function renderAppointments() {
    $("#appointments-body").innerHTML = appointments.map(item => `
      <tr>
        <td>${escapeHTML(item.name)}</td>
        <td>${escapeHTML(item.service)}</td>
        <td>${escapeHTML(item.date)}</td>
        <td>${escapeHTML(item.time)}</td>
        <td><span class="pill ${item.status === "Pendente" ? "pending" : ""}">${escapeHTML(item.status)}</span></td>
      </tr>
    `).join("");
  }

  function renderPatients() {
    $("#patients-list").innerHTML = chats.map(chat => `
      <div class="patient-row">
        <span class="contact-avatar ${escapeHTML(chat.color)}">${escapeHTML(chat.initials)}</span>
        <div><strong>${escapeHTML(chat.name)}</strong><p>Contato fictício · Registro de demonstração</p></div>
        <button class="button button-secondary" data-open-chat="${chat.id}">Conversar</button>
      </div>
    `).join("");

    $$("[data-open-chat]").forEach(button => {
      button.addEventListener("click", () => {
        selectedId = Number(button.dataset.openChat);
        renderChatList();
        renderMessages();
        navigate("conversas");
      });
    });
  }

  function openModal(title, description, fields, onSubmit) {
    $("#modal-title").textContent = title;
    $("#modal-description").textContent = description;

    const form = $("#modal-form");
    form.innerHTML = fields.map(field => `
      <label class="field-label" for="${field.id}">${escapeHTML(field.label)}</label>
      ${field.options
        ? `<select id="${field.id}" name="${field.id}" required>
            ${field.options.map(option => `<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`).join("")}
           </select>`
        : `<input id="${field.id}" name="${field.id}" maxlength="100" required placeholder="${escapeHTML(field.placeholder || "")}">`
      }
    `).join("") + `<button class="button button-primary" type="submit">Salvar na demonstração</button>`;

    $("#modal").classList.remove("hidden");

    form.onsubmit = event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      onSubmit(values);
      $("#modal").classList.add("hidden");
    };
  }

  $("#modal-close").addEventListener("click", () => {
    $("#modal").classList.add("hidden");
  });

  $("#modal").addEventListener("click", event => {
    if (event.target.id === "modal") {
      $("#modal").classList.add("hidden");
    }
  });

  $("#new-chat").addEventListener("click", () => {
    openModal(
      "Nova conversa de teste",
      "Crie um contato fictício para experimentar o atendimento.",
      [{ id: "name", label: "Nome fictício", placeholder: "Ex.: Camila Oliveira" }],
      values => {
        const name = values.name.trim();
        if (!name) return;

        const chat = {
          id: nextId++,
          name,
          initials: initials(name),
          color: "purple",
          time: currentTime(),
          status: "pendente",
          ai: false,
          unread: 0,
          messages: [{
            from: "them",
            text: "Olá! Esta é uma conversa criada para demonstração.",
            time: currentTime()
          }]
        };

        chats.unshift(chat);
        selectedId = chat.id;
        renderChatList();
        renderMessages();
        showToast("Conversa fictícia criada.");
      }
    );
  });

  $("#add-appointment").addEventListener("click", () => {
    openModal(
      "Novo agendamento de teste",
      "Este registro é fictício e não reserva um horário real.",
      [
        { id: "name", label: "Nome fictício", placeholder: "Nome para demonstração" },
        { id: "service", label: "Serviço", placeholder: "Ex.: Avaliação inicial" },
        { id: "date", label: "Data ilustrativa", placeholder: "Ex.: 20/10/2026" },
        { id: "time", label: "Horário ilustrativo", placeholder: "Ex.: 14:30" }
      ],
      values => {
        appointments.unshift({
          name: values.name,
          service: values.service,
          date: values.date,
          time: values.time,
          status: "Demonstrativo"
        });

        renderAppointments();
        showToast("Registro de demonstração adicionado.");
      }
    );
  });

  $("#assistant-form").addEventListener("submit", event => {
    event.preventDefault();

    const question = $("#assistant-question").value.trim();
    if (!question) {
      showToast("Digite uma pergunta para testar.");
      return;
    }

    $("#assistant-answer").textContent = simulateAIResponse(question);
    $("#assistant-answer").classList.remove("hidden");
  });

  $("#settings-form").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("#clinic-name").value.trim();
    const hours = $("#clinic-hours").value.trim();

    if (!name || !hours) {
      showToast("Preencha os dois campos.");
      return;
    }

    $(".profile-info strong").textContent = name;
    $("#settings-feedback").textContent =
      "Alterações aplicadas somente nesta sessão do navegador.";
    showToast("Configurações de demonstração atualizadas.");
  });

  $("#reset-demo").addEventListener("click", () => {
    chats = copyChats(originalChats);
    appointments = originalAppointments.map(item => ({ ...item }));
    selectedId = 1;
    activeFilter = "todas";
    nextId = 4;

    $("#chat-search").value = "";
    $$(".filter-button").forEach(button => {
      button.classList.toggle("active", button.dataset.filter === "todas");
    });

    renderChatList();
    renderMessages();
    showToast("Demonstração reiniciada.");
  });

  // Inicialização
  renderChatList();
  renderMessages();
  renderAppointments();
  renderPatients();

  const requestedPage = window.location.hash.replace("#", "");
  const initialPage = requestedPage || "conversas";
  navigate(initialPage);

  console.log("Odonto IA: protótipo interativo carregado.");
});
  
