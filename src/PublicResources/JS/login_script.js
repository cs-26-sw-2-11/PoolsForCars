window.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector<HTMLFormElement>("#loginForm");
  
  if (!form) {
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    fetch("/login", {
      method: "POST",
      headers: {"Content-Type": "application/json" },
      body: JSON.stringify({
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      })
    });
  })
})
