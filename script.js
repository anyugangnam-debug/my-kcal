function renderLogo() {
  const canvas = document.getElementById("logoCanvas");
  if (!canvas) return;

  const img = new Image();
  img.onload = () => {
    const off = document.createElement("canvas");
    off.width = img.width;
    off.height = img.height;
    const octx = off.getContext("2d");
    octx.drawImage(img, 0, 0);

    const imageData = octx.getImageData(0, 0, off.width, off.height);
    const d = imageData.data;

    let minX = off.width, minY = off.height, maxX = 0, maxY = 0;
    const whiteFloor = 200; // pixels whiter than this start fading to transparent
    const whiteCeil = 250; // pixels whiter than this are fully transparent

    for (let y = 0; y < off.height; y++) {
      for (let x = 0; x < off.width; x++) {
        const i = (y * off.width + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const whiteness = Math.min(r, g, b);

        if (whiteness <= whiteFloor) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }

        if (whiteness > whiteFloor) {
          const fade = Math.min(1, (whiteness - whiteFloor) / (whiteCeil - whiteFloor));
          d[i + 3] = Math.round(d[i + 3] * (1 - fade));
        }
      }
    }

    octx.putImageData(imageData, 0, 0);

    const pad = 12;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(off.width, maxX + pad) - cropX;
    const cropH = Math.min(off.height, maxY + pad) - cropY;

    canvas.width = cropW;
    canvas.height = cropH;
    canvas.getContext("2d").drawImage(off, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  };
  img.src = "logo.png";
}
renderLogo();

let gender = "male";

document.querySelectorAll(".gender-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".gender-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    gender = btn.dataset.gender;
  });
});

document.getElementById("calcForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const age = Number(document.getElementById("age").value);
  const height = Number(document.getElementById("height").value);
  const weight = Number(document.getElementById("weight").value);
  const activity = Number(document.getElementById("activity").value);
  const goalOffset = Number(document.getElementById("goal").value);

  // Mifflin-St Jeor equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === "male" ? 5 : -161;

  const tdee = bmr * activity;
  const goalCalories = Math.max(tdee * (1 + goalOffset), 0);
  const water = weight * 33; // mL, approx 33ml per kg body weight

  document.getElementById("bmrValue").textContent = Math.round(bmr).toLocaleString();
  document.getElementById("tdeeValue").textContent = Math.round(tdee).toLocaleString();
  document.getElementById("goalValue").textContent = Math.round(goalCalories).toLocaleString();
  document.getElementById("waterValue").textContent = Math.round(water).toLocaleString();

  document.getElementById("results").classList.remove("hidden");
  window.scrollBy({ top: 180, behavior: "smooth" });
});
