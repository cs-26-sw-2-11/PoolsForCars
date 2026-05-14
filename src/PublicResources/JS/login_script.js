window.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    if (!form) {
        return;
    }

    console.log("found form");
    console.log(form);


    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lastName: formData.get("lastName"),
                phone: formData.get("phoneNumber"),
            })
        });

        const data = await response.json();

        document.cookie = `userId=${data.id}`;

        if (response.status === 200) { // ok
            window.location.href = data.redirect;
        }
    })
})
