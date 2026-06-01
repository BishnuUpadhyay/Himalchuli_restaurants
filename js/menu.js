document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  // loadChefs();
});

/* =========================
   MENU LOADING
========================= */
function loadMenu() {
  fetch("menu.json")
    .then(res => res.json())
    .then(data => {
      console.log("Menu loaded once");

      const container = document.getElementById("menuContainer");
      container.innerHTML = "";

      data.forEach(section => {
        const card = document.createElement("div");
        card.className = "menu-card";

        let itemsHTML = "";

        section.items.forEach(item => {
          itemsHTML += `
            <a href="details.html?id=${item.id}" class="food-link">
              <div class="item">
                <span>${item.name}</span>
                <span>$${item.price}</span>
              </div>
            </a>
          `;
        });

        card.innerHTML = `
          <h3>${section.category}</h3>
          ${itemsHTML}
        `;

        container.appendChild(card);
      });
    })
    .catch(err => console.error("Menu load error:", err));
}


let allData = [];
let activeCategory = "All";

function loadMenu() {
  fetch("menu.json")
    .then(res => res.json())
    .then(data => {
      allData = data;

      renderTabs(data);
      renderMenu(data);

      console.log("Menu loaded once");
    })
    .catch(err => console.error("Menu load error:", err));
}

function renderTabs(data){
  const tabs = document.getElementById("menuTabs");

  const categories = ["All", ...data.map(d => d.category)];

  tabs.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.innerText = cat;

    if(cat === activeCategory) btn.classList.add("active");

    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderMenu(allData);
      renderTabs(allData);
    });

    tabs.appendChild(btn);
  });
}
function renderMenu(data){
  const container = document.getElementById("menuContainer");
  container.innerHTML = "";

  data.forEach(section => {

    if(activeCategory !== "All" && section.category !== activeCategory){
      return;
    }

    const card = document.createElement("div");
    card.className = "menu-card";

    let itemsHTML = "";

    section.items.forEach(item => {
      itemsHTML += `
        <a href="details.html?id=${item.id}" class="food-link">
          <div class="item">
            
            <div class="item-left">
              <img src="./images/${item.image}" alt="${item.name}">
              <span>${item.name}</span>
            </div>

            <span>$${item.price}</span>

          </div>
        </a>
      `;
    });

    card.innerHTML = `
      <h3>${section.category}</h3>
      ${itemsHTML}
    `;

    container.appendChild(card);
  });
}
/* =========================
   CHEFS LOADING
========================= */
function loadChefs() {
  fetch("chefs.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("chefContainer");
      container.innerHTML = "";

      let html = "";

      data.forEach(chef => {
        html += `
          <div class="chef-card">
            <img src="./images/${chef.image}" alt="${chef.name}">
            <div class="chef-info">
              <h3>${chef.name}</h3>
              <p>${chef.role}</p>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    })
    .catch(err => console.error("Chef load error:", err));
}