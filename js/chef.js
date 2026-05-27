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