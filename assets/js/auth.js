// simple authentication helper using users.json
const STORAGE_KEYS = { USER: "user" };

// assume the login form and message div exist in HTML
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authMessage = document.getElementById("authMessage");

function clearMessage() {
  if (!authMessage) return;
  authMessage.textContent = "";
  authMessage.className = "mt-2";
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const email = emailInput.value.trim().toLowerCase();
  const pass = passwordInput.value;
  if(!(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email))) {
    authMessage.textContent = "Please enter a valid email address.";
    authMessage.className = "alert alert-danger mt-2 text-danger";
    return;
  }

  if (!pass) {
    authMessage.textContent = "Please provide a password.";
    authMessage.className = "alert alert-danger mt-2 text-danger";
    return;
  }

  try {
    const resp = await fetch("./assets/json/users.json");
    const users = await resp.json();
    const user = users.find(
      (u) => u.email.toLowerCase() === email && u.password === pass,
    );
    // console.log("Login attempt:", { email, pass, userFound: !!user });
    if (user) {
      // store user info in session storage, redirect to services page
      sessionStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }),
      );
      window.location.href = "services.html";
    } else {
      authMessage.textContent = "Invalid credentials.";
      authMessage.className = "alert alert-danger mt-2 text-danger";
    }
  } catch (error) {
    console.error(error.message);
    authMessage.textContent = "Login failed, please try again later.";
    authMessage.className = "alert alert-danger mt-2 text-danger";
  }
});
