let hoursData = {};
fetch("./hours.json")
  .then(response => response.json())
  .then(data => {
    hoursData = data;

    updateStatus();

    setInterval(updateStatus, 60000);
  })
  .catch(error => {
    console.error("Error loading hours.json:", error);
  });

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(timeStr) {
  let [hours, minutes] = timeStr.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function getRestaurantStatus() {

  const now = new Date();

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];

  const today = days[now.getDay()];

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const todayData = hoursData[today];

  if (!todayData || !todayData.open) {
    return {
      open: false,
      message: "🔴 Closed Today"
    };
  }

  for (const slot of todayData.slots) {

    const start = timeToMinutes(slot.start);
    const end = timeToMinutes(slot.end);

    if (currentMinutes >= start && currentMinutes < end) {

      return {
        open: true,
        message: `🟢 Open Now • Closes at ${formatTime(slot.end)}`
      };
    }

    if (currentMinutes < start) {

      return {
        open: false,
        message: `🔴 Closed • Opens at ${formatTime(slot.start)}`
      };
    }
  }

  return {
    open: false,
    message: "🔴 Closed for Today"
  };
}

function updateStatus() {

  const result = getRestaurantStatus();

  document.querySelectorAll(".open-status").forEach(element => {

    element.textContent = result.message;

    element.classList.remove("open");
    element.classList.remove("closed");

    if (result.open) {
      element.classList.add("open");
    } else {
      element.classList.add("closed");
    }
  });
}

function buildHoursTable() {

  const container = document.getElementById("hoursTable");

  let html = "";

  for (const [day, info] of Object.entries(hoursData)) {

    const dayName =
      day.charAt(0).toUpperCase() + day.slice(1);

    if (!info.open) {

      html += `
        <div class="hours-row">
          <span class="day-name">${dayName}</span>
          <span class="closed-day">Closed</span>
        </div>
      `;

      continue;
    }

   const schedule = info.slots
  .map(slot =>
    `<div>${formatTime(slot.start)} - ${formatTime(slot.end)}</div>`
  )
  .join("");

    html += `
      <div class="hours-row">
        <span class="day-name">${dayName}</span>
        <div class="schedule-column">
  ${schedule}
</div>
      </div>
    `;
  }

  container.innerHTML = html;
}


const modal = document.getElementById("hoursModal");
const openBtn = document.getElementById("viewHoursBtn");
const closeBtn = document.querySelector(".close-modal");

openBtn.addEventListener("click", () => {
  buildHoursTable();
  modal.classList.add("show");
});

closeBtn.addEventListener("click", () => {
  modal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
  }
});