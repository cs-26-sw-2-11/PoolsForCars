window.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector<HTMLFormElement>("#updateUserForm");
  
  if (!form) {
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    fetch("/profile/1", {
      method: "PUT",
      headers: {"Content-Type": "application/json" },
      body: JSON.stringify({
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      })
    });
  })
})