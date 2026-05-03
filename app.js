// ============================================
// ROOTS & ROUTES — app.js
// Core UI logic, mock data, interactions
// ============================================

// ---- MOCK DATA ----
function getMockDestinations(filter = "all") {
  const all = [
    { id: "1", name: "Santorini, Greece", category: "beach", rating: 4.9, price: 1200, duration: "7 days", img: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80", description: "Iconic whitewashed villas overlooking the azure Aegean Sea." },
    { id: "2", name: "Rajasthan, India", category: "heritage", rating: 4.8, price: 680, duration: "10 days", img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80", description: "Royal palaces, desert safaris & vibrant folk culture." },
    { id: "3", name: "Bali, Indonesia", category: "beach", rating: 4.7, price: 920, duration: "8 days", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", description: "Tropical paradise with lush rice terraces and temple culture." },
    { id: "4", name: "Swiss Alps, Switzerland", category: "mountain", rating: 4.9, price: 2100, duration: "6 days", img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80", description: "Majestic snow peaks, crystal lakes and charming alpine villages." },
    { id: "5", name: "Kyoto, Japan", category: "heritage", rating: 4.8, price: 1450, duration: "9 days", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", description: "Ancient temples, geisha districts and cherry blossom trails." },
    { id: "6", name: "Patagonia, Argentina", category: "mountain", rating: 4.6, price: 2800, duration: "12 days", img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80", description: "Dramatic glaciers, granite spires and untouched wilderness." },
  ];
  if (filter === "all") return all;
  return all.filter(d => d.category === filter);
}

function getMockTours() {
  return [
    { id: "t1", name: "Golden Triangle India", duration: "8 Days / 7 Nights", groupSize: "Max 12", difficulty: "Easy", price: 899, badge: "Best Seller", img: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80" },
    { id: "t2", name: "Amalfi Coast Walk", duration: "6 Days / 5 Nights", groupSize: "Max 8", difficulty: "Moderate", price: 1650, badge: "Top Rated", img: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=600&q=80" },
    { id: "t3", name: "Northern Lights Norway", duration: "7 Days / 6 Nights", groupSize: "Max 10", difficulty: "Easy", price: 2400, badge: "Seasonal", img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80" },
    { id: "t4", name: "Amazon Rainforest Trek", duration: "10 Days / 9 Nights", groupSize: "Max 6", difficulty: "Hard", price: 3200, badge: "Adventure", img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80" },
  ];
}

function getMockTestimonials() {
  return [
    { name: "Sarah Mitchell", location: "New York, USA", rating: 5, text: "Roots & Routes completely transformed how I travel. The local insights and curated experiences were beyond anything I'd ever booked through other platforms.", avatar: "https://i.pravatar.cc/150?img=32" },
    { name: "Arnav Sharma", location: "Mumbai, India", rating: 5, text: "Booked the Rajasthan heritage tour and it exceeded all expectations. Every detail was perfect — from the heritage hotels to the expert guides.", avatar: "https://i.pravatar.cc/150?img=11" },
    { name: "Lena Hoffmann", location: "Berlin, Germany", rating: 5, text: "The Swiss Alps package was breathtaking. The team's attention to every small detail made it the most memorable trip of my life.", avatar: "https://i.pravatar.cc/150?img=45" },
  ];
}

// ---- RENDER FUNCTIONS ----

function renderDestinations(filter = "all") {
  const container = document.getElementById("destinationCards");
  if (!container) return;
  const dests = getMockDestinations(filter);
  container.innerHTML = dests.map(d => `
    <div class="col-sm-6 col-lg-4 dest-item" data-category="${d.category}">
      <div class="dest-card" onclick="viewDestination('${d.id}')">
        <div class="dest-img" style="background-image:url('${d.img}')">
          <span class="dest-category">${capitalize(d.category)}</span>
          <button class="dest-wishlist" onclick="event.stopPropagation(); toggleWishlist('${d.id}', this)" title="Save to Wishlist">
            <i class="fa fa-heart"></i>
          </button>
        </div>
        <div class="dest-body">
          <h5>${d.name}</h5>
          <p class="text-muted small mb-0">${d.description}</p>
          <div class="dest-meta">
            <div>
              <span class="dest-rating">★ ${d.rating}</span>
              <span class="dest-duration ms-2">${d.duration}</span>
            </div>
            <span class="dest-price">From $${d.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  `).join("");
  animateCards();
}

function renderTours() {
  const container = document.getElementById("tourCards");
  if (!container) return;
  const tours = getMockTours();
  container.innerHTML = tours.map(t => `
    <div class="col-sm-6 col-lg-3">
      <div class="tour-card">
        <div class="tour-img" style="background-image:url('${t.img}')">
          <span class="tour-badge">${t.badge}</span>
        </div>
        <div class="tour-body">
          <h5>${t.name}</h5>
          <div class="tour-meta">
            <span><i class="fa fa-clock me-1"></i>${t.duration}</span>
            <span><i class="fa fa-users me-1"></i>${t.groupSize}</span>
          </div>
          <div class="tour-footer">
            <div class="tour-price">
              <small>Per Person</small>
              $${t.price.toLocaleString()}
            </div>
            <button class="btn btn-accent btn-sm px-3" onclick="bookTour('${t.id}')">Book</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function renderTestimonials() {
  const container = document.getElementById("testimonialCards");
  if (!container) return;
  const reviews = getMockTestimonials();
  container.innerHTML = reviews.map(r => `
    <div class="col-md-4">
      <div class="review-card">
        <div class="review-stars">${"★".repeat(r.rating)}</div>
        <p class="review-text">"${r.text}"</p>
        <div class="review-author">
          <div class="review-avatar" style="background-image:url('${r.avatar}')"></div>
          <div>
            <h6>${r.name}</h6>
            <p>${r.location}</p>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// ---- INTERACTION HANDLERS ----

function viewDestination(id) {
  window.location.href = `destination-detail.html?id=${id}`;
}

function toggleWishlist(id, btn) {
  btn.classList.toggle("active");
  if (btn.classList.contains("active")) {
    btn.style.background = "var(--terracotta)";
    btn.style.color = "white";
    showToast("Added to wishlist ♥");
    if (typeof addToWishlist === "function") addToWishlist(id);
  } else {
    btn.style.background = "";
    btn.style.color = "";
    showToast("Removed from wishlist");
  }
}

function bookTour(id) {
  showToast("Redirecting to booking... 🚀");
  setTimeout(() => (window.location.href = `tour-detail.html?id=${id}`), 800);
}

function searchDestinations() {
  const q = document.getElementById("heroSearch")?.value.trim();
  if (q) window.location.href = `destinations.html?q=${encodeURIComponent(q)}`;
  else window.location.href = "destinations.html";
}

function filterTag(tag) {
  window.location.href = `destinations.html?q=${encodeURIComponent(tag)}`;
}

function subscribeNewsletter() {
  const email = document.getElementById("newsletterEmail")?.value.trim();
  if (!email || !email.includes("@")) {
    showToast("Please enter a valid email", "danger");
    return;
  }
  if (typeof subscribeToNewsletter === "function") {
    subscribeToNewsletter(email);
  } else {
    showToast("🎉 You're subscribed! Welcome aboard.");
  }
  document.getElementById("newsletterEmail").value = "";
}

// ---- FILTER TABS ----

document.addEventListener("DOMContentLoaded", () => {
  // Navbar scroll
  const nav = document.getElementById("mainNav");
  if (nav) {
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 50);
    });
  }

  // Init render
  renderDestinations();
  renderTours();
  renderTestimonials();

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderDestinations(btn.dataset.filter);
    });
  });

  // Animated counters
  initCounters();

  // Intersection observer for fade-in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".step-card, .review-card, .tour-card").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(el);
  });

  // Hero search on Enter
  const hs = document.getElementById("heroSearch");
  if (hs) hs.addEventListener("keydown", e => { if (e.key === "Enter") searchDestinations(); });
});

// ---- UTILS ----

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function showToast(msg, type = "success") {
  const toastEl = document.getElementById("appToast");
  const toastMsg = document.getElementById("toastMsg");
  if (!toastEl || !toastMsg) return;
  toastEl.className = `toast align-items-center text-white border-0 bg-${type}`;
  toastMsg.textContent = msg;
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
}

function animateCards() {
  document.querySelectorAll(".dest-card").forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(16px)";
    card.style.transition = `opacity 0.4s ${i * 0.08}s ease, transform 0.4s ${i * 0.08}s ease`;
    requestAnimationFrame(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    });
  });
}

function initCounters() {
  const counters = document.querySelectorAll(".stat-num");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = +e.target.dataset.target;
        let current = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          e.target.textContent = current.toLocaleString() + (target === 98 ? "%" : "+");
          if (current >= target) clearInterval(timer);
        }, 25);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// Intersection observer for element visibility
const visObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = "1";
      e.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.1 });

setTimeout(() => {
  document.querySelectorAll(".step-card, .review-card, .tour-card").forEach(el => {
    visObserver.observe(el);
  });
}, 100);
