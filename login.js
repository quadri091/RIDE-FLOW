const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="currentColor"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z"/></svg>`;
const eyeClosed = `<svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="currentColor"><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"/></svg>`;
const roleArray = ["rider", "driver"];
let roleIndex = 0;
const audio = document.getElementById("audio");
const api = config.API_URL;
const load = document.querySelector(".load");
const notify = document.querySelector(".notifys");
let givenValues = {};
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

function changeRole(params) {
  if (params == "rider") {
    roleIndex = 0;
    document.querySelector(".show").style.display = "block";
  } else {
    document.querySelector(".show").style.display = "none";
    roleIndex = 1;
  }
  switchBg();
}

function switchBg() {
  const elements = document.querySelectorAll(".role-btn");
  elements.forEach((member, index) => {
    member.style.background = index == roleIndex ? "#0a8f3c" : "transparent";
    member.style.color = index == roleIndex ? "white" : "#1f2937";
  });

  animate();
}

function animate() {
  const cont = document.querySelector(".cont");
  cont.classList.remove("cont-from");
  void cont.offsetWidth;
  cont.classList.add("cont-from");

  setTimeout(() => {
    cont.classList.remove("cont-from");
  }, 1000);
}

switchBg();
function show(params, item) {
  if (params.type == "password") {
    params.type = "text";
    item.innerHTML = eyeClosed;
    return;
  }
  params.type = "password";
  item.innerHTML = eyeOpen;
}

function restack() {
  const all = [...document.querySelectorAll(".notify:not(.leaving)")];

  if (all[0]) {
    all[0].style.height = "";
    all[0].style.overflow = "";
  }
  const frontH = all[0] ? all[0].offsetHeight : 0;

  all.forEach((el, i) => {
    el.style.zIndex = 100 - i;

    if (i > 0) {
      el.style.height = frontH + "px";
      el.style.overflow = "hidden";
    }

    el.style.transform = `translateY(${i * 12}px) scale(${1 - i * 0.05})`;
    el.style.opacity = i > 2 ? "0" : String(1 - i * 0.2);
    el.style.pointerEvents = i === 0 ? "auto" : "none";
  });
}

function dismissNotify(el) {
  if (!el || el.classList.contains("leaving")) return;
  el.classList.add("leaving");
  el.style.transform = "translateY(-130%) scale(1)";
  el.style.opacity = "0";
  el.style.pointerEvents = "none";
  restack();
  setTimeout(() => el.remove(), 450);
}

function notification(text) {
  audio.currentTime = 0;
  audio.play().catch(() => {});

  notify.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="notify">
      <div class="lefty">
        <div class="svg">
          <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#1EA850">
            <path d="M195-195q-35-35-35-85H60l18-80h113q17-19 40-29.5t49-10.5q26 0 49 10.5t40 29.5h167l84-360H182l4-17q6-28 27.5-45.5T264-800h456l-37 160h117l120 160-40 200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H400q0 50-35 85t-85 35q-50 0-85-35Zm442-245h193l4-21-74-99h-95l-28 120Zm-19-273 2-7-84 360 2-7 34-146 46-200ZM20-427l20-80h220l-20 80H20Zm80-146 20-80h260l-20 80H100Zm180 333q17 0 28.5-11.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 17 11.5 28.5T280-240Zm400 0q17 0 28.5-11.5T720-280q0-17-11.5-28.5T680-320q-17 0-28.5 11.5T640-280q0 17 11.5 28.5T680-240Z"/>
          </svg>
        </div>
        <div class="text">
          <h4>RIDE-FLOW</h4>
          <p>${text}</p>
        </div>
      </div>
      <p>Now</p>
    </div>
  `,
  );

  const el = notify.firstElementChild;

  el.style.transform = "translateY(-130%)";
  el.style.opacity = "0";
  void el.offsetWidth;

  restack();

  el.addEventListener("click", () => dismissNotify(el));
  setTimeout(() => dismissNotify(el), 4000);

  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 2000);
}

// login

const login = async (params) => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) {
    notification("All Fields Are Mandatory");
    return;
  }
  if (!isValidEmail(email)) {
    notification("Enter a valid email address");
    return;
  }
  if (password.length < 8) {
    notification("Password Should Be 8 Or Above");
    return;
  }
  load.style.top = 0;
  params.disabled = true;
  const request = await fetch(`${api}/form/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const response = await request.json();
  if (!request.ok && response.status == "not-verified") {
    const params = new URLSearchParams({
      email,
      verify: true,
    });
    load.style.top = "-100vh";
    params.disabled = false;
    location.href = `otp.html?${params.toString()}`;
    return;
  } else if (!request.ok && response.status == "email-changed") {
    notification(response.message);
    const params = new URLSearchParams({
      email: response.data,
      mailChanged: true,
      mailer: response.mailer,
    });
    setTimeout(() => {
      location.href = `otp.html?${params.toString()}`;
    }, 600);
  } else if (!request.ok && response.status == "password-otp") {
    notification(response.message);
    const params = new URLSearchParams({
      email: response.data,
      passwordForgot: true,
    });
    setTimeout(() => {
      location.href = `otp.html?${params.toString()}`;
    }, 600);
  } else if (!request?.ok) {
    load.style.top = "-100vh";
    params.disabled = false;
    setTimeout(() => {
      notification(response.message);
    }, 600);
    return;
  }

  load.style.top = "-100vh";
  params.disabled = true;
  setTimeout(() => {
    notification(response.message);
    params.disabled = true;
    localStorage.setItem("details", JSON.stringify(response.data));
  }, 600);
  setTimeout(() => {
    if (response.data.role == "driver") {
      location.href = "/driver/dashboard.html";
    } else if (response.data.role == "rider") {
      location.href = "/rider/dashboard.html";
    }
  }, 1000);
};

// google auth

let client;
window.onload = function () {
  client = google.accounts.oauth2.initCodeClient({
    client_id:
      "77818084923-79i7kmmjoal7jfeier7a3kpak0qml2m5.apps.googleusercontent.com",
    scope: "email profile openid",
    ux_mode: "popup",
    callback: handleCredentialResponse,
  });
};

function googleAuth() {
  if (!client) {
    notification("Google client not ready yet.");
    console.warn("Google client not ready yet.");
    return;
  }
  client.requestCode();
}

async function handleCredentialResponse(response) {
  load.style.top = 0;
  const res = await fetch(`${api}/form/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: response.code }),
  });

  const data = await res.json();

  if (!res.ok && data.status == "email-changed") {
    notification(data.message);
    const params = new URLSearchParams({
      email: data.data,
      mailChanged: true,
      mailer: data.mailer,
    });
    setTimeout(() => {
      location.href = `otp.html?${params.toString()}`;
    }, 600);
  } else if (!res.ok && data.status == "password-otp") {
    notification(data.message);
    const params = new URLSearchParams({
      email: data.data,
      passwordForgot: true,
    });
    setTimeout(() => {
      location.href = `otp.html?${params.toString()}`;
    }, 600);
  } else if (!res.ok) {
    load.style.top = "-100vh";
    notification(data.message || "Google sign-in failed");
    return;
  }
  load.style.top = "-100vh";
  localStorage.setItem("details", JSON.stringify(data.data));
  notification(data.message);
  setTimeout(() => {
    location.href = "/rider/dashboard.html";
  }, 1500);
}

const forgot = async () => {
  let text;
  const email = document.getElementById("email").value.trim();

  if (!email) {
    const pro = prompt("Input Your Email Here");
    if (!pro || !pro.trim()) {
      notification("Email Is Required");
      return;
    }
    text = pro.trim();
  } else if (!isValidEmail(email)) {
    const pro = prompt("Input A Valid Email Here", email);
    if (!pro || !pro.trim()) {
      notification("Email Is Required");
      return;
    }
    text = pro.trim();
  } else {
    text = email;
  }

  if (!isValidEmail(text)) {
    notification("Enter A Valid Email Address");
    return;
  }

  load.style.top = 0;
  const request = await fetch(`${api}/form/send-verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const response = await request.json();

  if (!request?.ok) {
    load.style.top = "-100vh";
    document.querySelector(".continue-btn").disabled = false;
    setTimeout(() => {
      notification(response.message);
    }, 600);
    return;
  }
  load.style.top = "-100vh";
  document.querySelector(".continue-btn").disabled = false;
  setTimeout(() => {
    notification(response.message);
  }, 600);
};
document.querySelectorAll(".ripple-btn").forEach((button) => {
  button.addEventListener("click", function (e) {
    const existingRipple = this.querySelector(".ripple");
    if (existingRipple) {
      existingRipple.remove();
    }

    const circle = document.createElement("span");
    const diameter = Math.max(this.clientWidth, this.clientHeight);
    const radius = diameter / 2;

    const rect = this.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    this.appendChild(circle);
  });
});

animateOnScroll(
  ".visual .brand, .visual .headline, .visual .perk, .visual .trust-banner, .card > *",
);
