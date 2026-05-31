const providers = [
  {
    id: "p-101",
    name: "Asha Electrical",
    category: "Electrician",
    city: "Kathmandu",
    rating: 4.8,
    completed: 132,
    verified: true,
    price: "NPR 700+",
    initials: "AE",
    skills: ["Wiring", "Repairs", "Home visits"],
    response: "18 min",
    status: "Approved"
  },
  {
    id: "p-102",
    name: "Bikash Plumbing",
    category: "Plumber",
    city: "Lalitpur",
    rating: 4.6,
    completed: 89,
    verified: true,
    price: "NPR 650+",
    initials: "BP",
    skills: ["Leak repair", "Bathroom", "Pipe fitting"],
    response: "25 min",
    status: "Approved"
  },
  {
    id: "p-103",
    name: "CleanNest Team",
    category: "Cleaner",
    city: "Kathmandu",
    rating: 4.7,
    completed: 74,
    verified: true,
    price: "NPR 1,200+",
    initials: "CN",
    skills: ["Deep clean", "Move-out", "Office"],
    response: "35 min",
    status: "Approved"
  },
  {
    id: "p-104",
    name: "Ramesh Auto Care",
    category: "Mechanic",
    city: "Bhaktapur",
    rating: 4.4,
    completed: 58,
    verified: false,
    price: "NPR 900+",
    initials: "RA",
    skills: ["Bike repair", "Inspection", "Pickup"],
    response: "42 min",
    status: "Pending"
  },
  {
    id: "p-105",
    name: "Sita Home Tutor",
    category: "Tutor",
    city: "Pokhara",
    rating: 4.9,
    completed: 116,
    verified: true,
    price: "NPR 800/hr",
    initials: "ST",
    skills: ["Math", "Science", "Grade 6-10"],
    response: "12 min",
    status: "Approved"
  }
];

const reports = [
  {
    id: "r-201",
    title: "Unclear price quote",
    target: "Ramesh Auto Care",
    priority: "Medium",
    status: "Pending"
  },
  {
    id: "r-202",
    title: "Duplicate service listing",
    target: "CleanNest Team",
    priority: "Low",
    status: "Pending"
  }
];

const defaultProfile = {
  name: "DailyHub Customer",
  phone: "9800000000",
  city: "Kathmandu",
  address: "New Baneshwor",
  role: "customer"
};

const state = {
  profile: load("dailyhub.profile", defaultProfile),
  bookings: load("dailyhub.bookings", []),
  selectedProviderId: null,
  view: "dashboard"
};

const views = {
  dashboard: document.querySelector("#dashboardView"),
  services: document.querySelector("#servicesView"),
  bookings: document.querySelector("#bookingsView"),
  profile: document.querySelector("#profileView"),
  admin: document.querySelector("#adminView")
};

const viewTitles = {
  dashboard: "Overview",
  services: "Service discovery",
  bookings: "Bookings",
  profile: "Profile",
  admin: "Admin review"
};

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function moneylessDate() {
  return new Date().toISOString().slice(0, 10);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function unique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function setView(nextView) {
  state.view = nextView;
  Object.entries(views).forEach(([key, element]) => {
    element.classList.toggle("active-view", key === nextView);
  });
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === nextView);
  });
  document.querySelector("#viewTitle").textContent = viewTitles[nextView];
  render();
}

function renderSession() {
  document.querySelector("#sessionSummary").innerHTML = `
    <strong>${state.profile.name}</strong>
    <span>${state.profile.role.replace("_", " ")} · ${state.profile.city}</span>
  `;
  document.querySelector("#authNotice").style.display = state.profile.name ? "none" : "block";
}

function renderFilters() {
  const categories = ["All categories", ...unique(providers.map((provider) => provider.category))];
  const cities = ["All cities", ...unique(providers.map((provider) => provider.city))];
  const categoryFilter = document.querySelector("#categoryFilter");
  const cityFilter = document.querySelector("#cityFilter");
  const profileCity = document.querySelector("#profileCity");

  if (!categoryFilter.options.length) {
    categoryFilter.innerHTML = categories.map((item) => `<option value="${item}">${item}</option>`).join("");
  }

  if (!cityFilter.options.length) {
    cityFilter.innerHTML = cities.map((item) => `<option value="${item}">${item}</option>`).join("");
    cityFilter.value = state.profile.city;
  }

  if (!profileCity.options.length) {
    profileCity.innerHTML = unique([...providers.map((provider) => provider.city), state.profile.city])
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("");
  }
}

function filteredProviders() {
  const search = document.querySelector("#searchInput").value.trim().toLowerCase();
  const category = document.querySelector("#categoryFilter").value;
  const city = document.querySelector("#cityFilter").value;
  const verifiedOnly = document.querySelector("#verifiedOnly").checked;

  return providers.filter((provider) => {
    const matchesSearch = !search || [provider.name, provider.category, provider.city, provider.skills.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(search);
    const matchesCategory = category === "All categories" || provider.category === category;
    const matchesCity = city === "All cities" || provider.city === city;
    const matchesVerified = !verifiedOnly || provider.verified;
    return matchesSearch && matchesCategory && matchesCity && matchesVerified;
  });
}

function providerCard(provider, compact = false) {
  const verified = provider.verified
    ? '<span class="verified">Verified</span>'
    : '<span class="warning">Needs review</span>';
  return `
    <article class="provider-card">
      <div class="provider-card-header">
        <div class="provider-title">
          <span class="avatar">${provider.initials}</span>
          <div>
            <h4>${provider.name}</h4>
            <div class="provider-meta">
              <span>${provider.category}</span>
              <span>${provider.city}</span>
            </div>
          </div>
        </div>
        ${verified}
      </div>
      <div class="provider-meta">
        <span class="tag">${provider.rating.toFixed(1)} rating</span>
        <span class="tag">${provider.completed} jobs</span>
        <span class="tag">${provider.price}</span>
        <span class="tag">${provider.response}</span>
      </div>
      ${compact ? "" : `<p class="muted-text">${provider.skills.join(" · ")}</p>`}
      <button class="primary-button" type="button" data-book="${provider.id}">Book provider</button>
    </article>
  `;
}

function renderDashboard() {
  const approved = providers.filter((provider) => provider.status === "Approved").length;
  const pending = providers.length - approved;
  const openBookings = state.bookings.filter((booking) => booking.status !== "Completed").length;
  const metrics = [
    ["Providers", providers.length],
    ["Verified", approved],
    ["Pending review", pending],
    ["Open bookings", openBookings]
  ];
  document.querySelector("#metricGrid").innerHTML = metrics
    .map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");

  document.querySelector("#featuredProviders").innerHTML = providers
    .filter((provider) => provider.verified && provider.city === state.profile.city)
    .slice(0, 3)
    .map((provider) => providerCard(provider, true))
    .join("") || '<p class="muted-text">No verified providers in this city yet. Try all cities in Services.</p>';
}

function renderProviders() {
  const list = filteredProviders();
  document.querySelector("#providerList").innerHTML = list.length
    ? list.map((provider) => providerCard(provider)).join("")
    : '<section class="panel"><p class="muted-text">No providers match these filters.</p></section>';

  const selected = providers.find((provider) => provider.id === state.selectedProviderId);
  document.querySelector("#bookingProviderHint").textContent = selected
    ? `${selected.name} · ${selected.category} · ${selected.city}`
    : "Choose a provider to start.";
}

function renderBookings() {
  const bookingList = document.querySelector("#bookingList");
  if (!state.bookings.length) {
    bookingList.innerHTML = '<p class="muted-text">No bookings yet. Browse services and create your first request.</p>';
    return;
  }

  bookingList.innerHTML = state.bookings.map((booking) => `
    <article class="booking-card">
      <div class="booking-card-header">
        <div>
          <h4>${booking.providerName}</h4>
          <div class="booking-meta">
            <span>${booking.category}</span>
            <span>${booking.date}</span>
            <span>${booking.location}</span>
          </div>
        </div>
        <span class="status-pill ${booking.status === "Completed" ? "success" : "muted"}">${booking.status}</span>
      </div>
      <p>${booking.details}</p>
      <div class="booking-meta">
        <button class="secondary-button" data-status="${booking.id}" data-next="Accepted" type="button">Accept</button>
        <button class="secondary-button" data-status="${booking.id}" data-next="Completed" type="button">Complete</button>
        <button class="ghost-button" data-remove="${booking.id}" type="button">Cancel</button>
      </div>
    </article>
  `).join("");
}

function renderProfile() {
  document.querySelector("#profileName").value = state.profile.name;
  document.querySelector("#profilePhone").value = state.profile.phone;
  document.querySelector("#profileCity").value = state.profile.city;
  document.querySelector("#profileAddress").value = state.profile.address;
  document.querySelector("#profileRole").value = state.profile.role;
}

function renderAdmin() {
  document.querySelector("#approvalQueue").innerHTML = providers
    .filter((provider) => provider.status !== "Approved")
    .map((provider) => `
      <article class="queue-item">
        <div class="queue-item-header">
          <div>
            <h4>${provider.name}</h4>
            <div class="queue-meta">
              <span>${provider.category}</span>
              <span>${provider.city}</span>
            </div>
          </div>
          <span class="warning">${provider.status}</span>
        </div>
        <button class="secondary-button" data-approve="${provider.id}" type="button">Approve provider</button>
      </article>
    `).join("") || '<p class="muted-text">No providers waiting for approval.</p>';

  document.querySelector("#reportQueue").innerHTML = reports.map((report) => `
    <article class="queue-item">
      <div class="queue-item-header">
        <div>
          <h4>${report.title}</h4>
          <div class="queue-meta">
            <span>${report.target}</span>
            <span>${report.priority}</span>
          </div>
        </div>
        <span class="danger">${report.status}</span>
      </div>
      <button class="ghost-button" data-resolve="${report.id}" type="button">Mark reviewed</button>
    </article>
  `).join("");
}

function render() {
  renderSession();
  renderFilters();
  renderDashboard();
  renderProviders();
  renderBookings();
  renderProfile();
  renderAdmin();
}

function createBooking(event) {
  event.preventDefault();
  const provider = providers.find((item) => item.id === state.selectedProviderId);
  if (!provider) {
    showToast("Choose a provider before creating a booking.");
    return;
  }

  const details = document.querySelector("#bookingDetails").value.trim();
  const date = document.querySelector("#bookingDate").value || moneylessDate();
  const location = document.querySelector("#bookingLocation").value.trim() || state.profile.city;

  if (!details) {
    showToast("Add service details for the provider.");
    return;
  }

  state.bookings.unshift({
    id: `b-${Date.now()}`,
    providerId: provider.id,
    providerName: provider.name,
    category: provider.category,
    details,
    date,
    location,
    status: "Requested"
  });
  save("dailyhub.bookings", state.bookings);
  event.currentTarget.reset();
  showToast("Booking request created.");
  setView("bookings");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.view) setView(button.dataset.view);
  if (button.dataset.jump) setView(button.dataset.jump);

  if (button.dataset.book) {
    state.selectedProviderId = button.dataset.book;
    setView("services");
    showToast("Provider selected for booking.");
  }

  if (button.dataset.status) {
    const booking = state.bookings.find((item) => item.id === button.dataset.status);
    if (booking) {
      booking.status = button.dataset.next;
      save("dailyhub.bookings", state.bookings);
      showToast(`Booking marked ${booking.status.toLowerCase()}.`);
      render();
    }
  }

  if (button.dataset.remove) {
    state.bookings = state.bookings.filter((item) => item.id !== button.dataset.remove);
    save("dailyhub.bookings", state.bookings);
    showToast("Booking cancelled.");
    render();
  }

  if (button.dataset.approve) {
    const provider = providers.find((item) => item.id === button.dataset.approve);
    if (provider) {
      provider.status = "Approved";
      provider.verified = true;
      showToast(`${provider.name} approved.`);
      render();
    }
  }

  if (button.dataset.resolve) {
    const report = reports.find((item) => item.id === button.dataset.resolve);
    if (report) {
      report.status = "Reviewed";
      showToast("Report marked reviewed.");
      render();
    }
  }
});

document.querySelector("#bookingForm").addEventListener("submit", createBooking);

document.querySelector("#profileForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.profile = {
    name: document.querySelector("#profileName").value.trim() || "DailyHub User",
    phone: document.querySelector("#profilePhone").value.trim(),
    city: document.querySelector("#profileCity").value,
    address: document.querySelector("#profileAddress").value.trim(),
    role: document.querySelector("#profileRole").value
  };
  save("dailyhub.profile", state.profile);
  showToast("Profile saved.");
  render();
});

document.querySelector("#demoCustomerBtn").addEventListener("click", () => {
  state.profile = { ...defaultProfile, name: "DailyHub Customer", role: "customer" };
  save("dailyhub.profile", state.profile);
  showToast("Customer demo loaded.");
  render();
});

document.querySelector("#demoAdminBtn").addEventListener("click", () => {
  state.profile = { ...defaultProfile, name: "DailyHub Admin", role: "admin" };
  save("dailyhub.profile", state.profile);
  setView("admin");
  showToast("Admin demo loaded.");
});

document.querySelector("#signOutBtn").addEventListener("click", () => {
  state.profile = { name: "", phone: "", city: "Kathmandu", address: "", role: "customer" };
  save("dailyhub.profile", state.profile);
  showToast("Signed out locally.");
  render();
});

["#searchInput", "#categoryFilter", "#cityFilter", "#verifiedOnly"].forEach((selector) => {
  document.querySelector(selector).addEventListener("input", renderProviders);
  document.querySelector(selector).addEventListener("change", renderProviders);
});

render();
