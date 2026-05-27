var userId = document.cookie.split('userId=')[1];

if (userId === undefined || userId === 'undefined') {
    window.location.replace("/login");
}


async function getData() {
    const url = `/notifications/${userId}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Notification get request failed");
        }

        const result = await response.json();

        return result;

    } catch (error) {
        console.error("Error fetching user notifications:", error);
    }
}

// =========================
// RENDER FUNCTION
// =========================

function renderNotifications(notifications) {

    const container = document.getElementById("groups-container");
    container.innerHTML = "";

    notifications.forEach(notification => {
        const info = notification.info;
        const plans = notification.plans;


        const table = document.createElement("table");
        table.border = "1";

        // HEADER ROW
        const headerRow = document.createElement("tr");

        headerRow.innerHTML = `
                    <th>Group ${info.groupId}</th>
                    <th>${info.day}</th>
                    <th>Week ${info.week}</th>
                `;

        // <th>Total Detour: ${.totalDetourTime} min</th>
        table.appendChild(headerRow);

        // REQUEST ROWS
        for (const [userId, plan] of Object.entries(plans)) {

            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent =
                `${plan.insertionCandidate.name}`;

            const detourCell = document.createElement("td");
            detourCell.textContent =
                `${+(plan.estimatedAddedDetour / 60).toFixed(2)} min`;

            const actionCell = document.createElement("td");

            const acceptBtn = document.createElement("button");
            acceptBtn.textContent = "Accept";

            acceptBtn.onclick = () => {
                fetch(
                    `/groups/${info.groupId}/${userId}/accept`,
                    { method: "POST" }
                ).then(() => {
                    getData().then((notifications) => {
                        renderNotifications(notifications);
                    })
                })
            };

            const denyBtn = document.createElement("button");
            denyBtn.textContent = "Deny";

            denyBtn.onclick = () => {
                fetch(
                    `/groups/${info.groupId}/${userId}/deny`,
                    { method: "POST" }).then(() => {
                        getData().then((notifications) => {
                            renderNotifications(notifications);
                        })
                    })
            };

            actionCell.appendChild(acceptBtn);
            actionCell.appendChild(denyBtn);

            row.appendChild(nameCell);
            row.appendChild(detourCell);
            row.appendChild(actionCell);

            table.appendChild(row);
        }

        container.appendChild(table);
        container.appendChild(document.createElement("br"));
    });
}

// =========================
// INIT
// =========================

const notifications = getData().then(notifications => {
    renderNotifications(notifications)
})
