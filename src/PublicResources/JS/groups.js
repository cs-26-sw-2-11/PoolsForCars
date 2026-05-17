var userId = document.cookie.split('userId=')[1];

if (userId === undefined || userId === 'undefined') {
    window.location.replace("/login");
}


//Subjects to be changed
let currentDate = new Date();
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
let currentDay = days[(currentDate.getDay() + 6) % 7];
let currentWeek = getDateWeek(currentDate);
let currentMode = "driver";
let activeGroup = {};

const weekLabel = document.getElementById("weekLabel");
const prevBtn = document.getElementById("prevWeek");
const nextBtn = document.getElementById("nextWeek");

function renderWeek() {
    weekLabel.textContent = `Week ${currentWeek}`;
    renderGroups();
    renderSchedule();

}

prevBtn.addEventListener("click", () => {
    if (currentWeek > 1) {
        currentWeek--;
        renderWeek();
    }
});

nextBtn.addEventListener("click", () => {
    currentWeek++;
    renderWeek();
});

// Groups and stuff that decides when they show up

const groups = [
    { day: "Monday", role: "driver", name: "ALG med Gutterne" },
    { day: "Tuesday", role: "passenger", name: "Skyd mig det er en SLIAL dag" },
    { day: "Wednesday", role: "passenger", name: "DEB er BED baglæns" },
    { day: "Friday", role: "driver", name: "IWP står for I Wanna Pray" }
];

var passengerGroups = [];
var driverGroups = [];
getData();

async function getData() {
    var url = "/groups/" + userId;

    try {
        var driverResponse = await fetch(url + "/driver");
        var passengerResponse = await fetch(url + "/passenger");

        if (!driverResponse.ok) {
            throw new Error("response status " + driverResponse.status);
        } else if (!passengerResponse.ok) {
            throw new Error("response status " + passengerResponse.status);
        }

        driverGroups = await driverResponse.json();
        passengerGroups = await passengerResponse.json();

    } catch (error) {
        console.error(error.message);
    }
}

// Initialize current date and week
function getDateWeek(date) {
    const tempDate = new Date(date.valueOf());
    const dayNum = (date.getDay() + 6) % 7;
    tempDate.setDate(tempDate.getDate() - dayNum + 3);
    const firstThursday = tempDate.valueOf();

    tempDate.setMonth(0, 1);
    if (tempDate.getDay() !== 4) {
        tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000);

}

function renderGroups() {

    const groupTitleElement = document.querySelector(".group-title");

    var visibleGroup;

    if (currentMode === "passenger") {
        visibleGroup = passengerGroups.find(group =>
            group.day === currentDay &&
            group.week === currentWeek
        );
    } else if (currentMode === "driver") {
        visibleGroup = driverGroups.find(group =>
            group.day === currentDay &&
            group.week === currentWeek
        );
    }


    // const visibleGroups = groups.filter(group => {
    //     return (
    //         group.day === currentDay &&
    //         group.role === currentMode
    //     );
    // });

    // const activeGroup = visibleGroups[0];
    activeGroup = visibleGroup;

    if (!activeGroup) {
        groupTitleElement.textContent = "No group available";
        return;
    }

    // groupTitleElement.textContent = activeGroup.name;
    groupTitleElement.textContent = visibleGroup.id;
}

// Things to do with modes

function setMode(mode) {
    const allowedModes = ["driver", "passenger"];
    if (!allowedModes.includes(mode)) {
        console.warn("Invalid mode detected!");
        return;
    }
    currentMode = mode;

    /// Changing of the title

    document.body.classList.remove("mode-driver", "mode-passenger");
    document.body.classList.add(`mode-${mode}`);

    const title = document.getElementById("pageTitle");
    if (mode === "driver") {
        title.textContent = "My Groups - Driver";
    } else {
        title.textContent = "My Groups - Passenger";
    }
    renderGroups();
    renderSchedule();
}

/// Beeg toggle
const modeToggle = document.querySelector(".switch input");

modeToggle.addEventListener("change", () => {

    let mode = "";

    if (modeToggle.checked) {
        mode = "passenger";
    } else {
        mode = "driver";
    }
    setMode(mode);
});

let initialMode;

if (modeToggle.checked) {
    initialMode = "passenger";
} else {
    initialMode = "driver";
}





// Grab all weekday items
const dayItems = document.querySelectorAll(".day-list li");

// Schedule data
const schedules = {
    Monday: [
        { time: "07:00", address: "Muligvisvej 3" }
    ],
    Tuesday: [
        { time: "07:00", address: "Vestergade 12" },
        { time: "07:20", address: "Kattevej 21" }

    ],
    Wednesday: [],
    Thursday: [],
    Friday: []
};

// Where schedule rows will be rendered
const scheduleElement = document.querySelector(".schedule");


// Render schedule for a given day
function renderSchedule() {
    scheduleElement.innerHTML = "";

    // const entries = schedules[day];
    // if (!entries || entries.length === 0) {
    //     scheduleElement.textContent = "No schedule for this day";
    //     return;
    // }
    if (!activeGroup) {
        scheduleElement.textContent = "No schedule for this day";
        return;
    }

    activeGroup.route.forEach(entry => {
        const row = document.createElement("div");
        row.className = "schedule-row";

        const name = document.createElement("span");
        name.className = "name";
        name.textContent = entry.name;

        const time = document.createElement("span");
        time.className = "time";

        const hours = Math.floor(entry.time / 3600);
        const minutes = Math.floor((entry.time % 3600) / 60);
        time.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

        const address = document.createElement("span");
        address.className = "address";
        address.textContent = entry.address;

        row.append(name, time, address);
        scheduleElement.appendChild(row);
    });
}

// Click handling for weekday selection
dayItems.forEach(day => {
    day.addEventListener("click", () => {
        dayItems.forEach(d => d.classList.remove("active"));
        day.classList.add("active");

        currentDay = day.textContent;

        renderGroups();

        renderSchedule();

    });
});

// Initial render
setMode(initialMode);
renderWeek(currentWeek);
