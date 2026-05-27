const toggle = document.getElementById("navToggle");
const nav = document.getElementById("navLinks");

toggle.addEventListener("click", () => {
    console.log("Clicked")
  nav.classList.toggle("show");
});