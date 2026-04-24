var dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];


function buildDayPayload(form, dayName) {
    var seatsValue = form.get("signup" + dayName + "SeatsOffered" );
    var pickupAddress = String(form.get("signup" + dayName + "PickupPoint") || "").trim();
    var destinationAddress = String(form.get("signup" + dayName + "Destination") || "").trim();
    var arrivalTime = String(form.get("signup" + dayName + "TimeOfArrival") || "").trim();

    return {
        day: dayName,
        carAvailability: form.get("signup" + dayName + "CarAvailability") === "true",
        seatsOffered: Number(seatsValue || 0),
        carpoolingIntent: form.get("signup" + dayName + "CarpoolingIntent") === "true",
        pickupPoint: {
            address: pickupAddress,
            coordinates: [0, 0]
        },
        destination: {
            address: destinationAddress,
            coordinates: [0, 0]
        },
        timeOfArrival: arrivalTime
    };
}

function buildUserPayload(form) {
    var scheduleDays = {};

    dayNames.forEach(function (dayName) {
        scheduleDays[dayName] = buildDayPayload(form, dayName);
    });

    var schedule = {
        days: scheduleDays
    };

    return {
        firstName: String(form.get("firstName") || "").trim(),
        lastName: String(form.get("lastName") || "").trim(),
        phoneNumber: String(form.get("phoneNumber") || "").trim(),
        schedule: schedule,
        calender: {
            1: schedule
        }
    };
}

document.querySelectorAll("[data-day-picker]").forEach(function (dayGrid) {
    var dayInputs = dayGrid.parentElement.querySelectorAll('.day-selector input[type="radio"]');
    var dayCards = dayGrid.querySelectorAll("[data-day-card]");
    var selectedDay = "";

    function syncDayCards() {
        dayCards.forEach(function (card) {
            var isSelected = card.dataset.dayCard === selectedDay;
            card.hidden = !isSelected;
        });
    }

    dayInputs.forEach(function (input) {
        if (input.checked) {
            selectedDay = input.value;
        }

        input.addEventListener("change", function () {
            selectedDay = input.value;
            syncDayCards();
        });
    });

    if (!selectedDay && dayInputs.length > 0) {
        selectedDay = dayInputs[0].value;
        dayInputs[0].checked = true;
    }

    syncDayCards();
});

document.querySelectorAll("[data-role-card]").forEach(function (card) {
    var roleInputs = card.querySelectorAll('input[name$="RideRole"]');
    var availabilityInput = card.querySelector('input[name$="CarAvailability"]');
    var seatsInput = card.querySelector('input[name$="SeatsOffered"]');

    function syncRole() {
        var selected = card.querySelector('input[name$="RideRole"]:checked');
        var isDriver = selected && selected.value === "driver";
        availabilityInput.value = isDriver ? "true" : "false";
        seatsInput.disabled = !isDriver;

        if (!isDriver) {
            seatsInput.value = "0";
        }
    }

    roleInputs.forEach(function (input) {
        input.addEventListener("change", syncRole);
    });

    syncRole();
});

window.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("signupForm");

    if (!form) {
        return;
    }
    
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var formData = new FormData(form);
        var userPayload = buildUserPayload(formData);
        
        fetch("/users", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(userPayload)
        });
    });
});
