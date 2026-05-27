document.addEventListener("DOMContentLoaded", () => {
  loadChefs();
});

function loadChefs() {
  fetch("chef.json")
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

// fetch("chefs.json")
//   .then(response => response.json())
//   .then(data => {

//     const container = document.getElementById("chefContainer");

//     data.forEach(chef => {

//       container.innerHTML += `

//         <div class="chef-card">

//           <img src="./images/${chef.image}" alt="${chef.name}">

//           <div class="chef-info">

//             <h3>${chef.name}</h3>

//             <p>${chef.role}</p>

//           </div>

//         </div>

//       `;

//     });

//   })
//   .catch(error => {
//     console.log("Error loading chefs:", error);
//   });