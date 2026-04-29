
var profileForm = document.getElementById("profileForm");
var editButton = document.getElementById("editProfile");
var saveButton = document.getElementById("saveProfile");

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

function syncRoleCard(card) {
    var availabilityInputs = card.querySelectorAll('input[name$="CarAvailability"]');
    var seatsInput = card.querySelector('input[name$="SeatsOffered"]');
    var pickupInput = card.querySelector('input[name$="PickupPoint"]');
    var destinationInput = card.querySelector('input[name$="Destination"]');
    var arrivalInput = card.querySelector('input[name$="TimeOfArrival"]');
    var selectedCarpoolIntent = card.querySelector('input[name$="CarpoolingIntent"]:checked');
    var selectedCarAvailability = card.querySelector('input[name$="CarAvailability"]:checked');
    var wantsToCarpool = selectedCarpoolIntent && selectedCarpoolIntent.value === "true";
    var isDriver = selectedCarAvailability && selectedCarAvailability.value === "true";

    availabilityInputs.forEach(function (input) {
        input.disabled = !wantsToCarpool;
    });

    seatsInput.disabled = !isDriver || !wantsToCarpool;
    pickupInput.disabled = !wantsToCarpool;
    destinationInput.disabled = !wantsToCarpool;
    arrivalInput.disabled = !wantsToCarpool;

    pickupInput.required = wantsToCarpool;
    destinationInput.required = wantsToCarpool;
    arrivalInput.required = wantsToCarpool;

    if (!isDriver || !wantsToCarpool) {
        seatsInput.value = "0";
    }

    if (!wantsToCarpool) {
        pickupInput.value = "";
        destinationInput.value = "";
        arrivalInput.value = "";
        card.classList.add("day-card--not-carpooling");
    } else {
        card.classList.remove("day-card--not-carpooling");
    }
}

function syncProfileRoleCards() {
    document.querySelectorAll("[data-role-card]").forEach(syncRoleCard);
}

document.querySelectorAll("[data-role-card]").forEach(function (card) {
    var availabilityInputs = card.querySelectorAll('input[name$="CarAvailability"]');
    var carpoolInputs = card.querySelectorAll('input[name$="CarpoolingIntent"]');

    availabilityInputs.forEach(function (input) {
        input.addEventListener("change", function () {
            syncRoleCard(card);
        });
    });

    carpoolInputs.forEach(function (input) {
        input.addEventListener("change", function () {
            syncRoleCard(card);
        });
    });

    syncRoleCard(card);
});

window.addEventListener("DOMContentLoaded", function () {
    if (!profileForm || !editButton || !saveButton) {
        return;
    }

    profileForm.querySelectorAll("input, select, textarea").forEach(function (field) {
        field.disabled = true;
    });

    editButton.disabled = false;
    saveButton.disabled = true;

    editButton.addEventListener("click", function () {
        profileForm.querySelectorAll("input, select, textarea").forEach(function (field) {
            field.disabled = false;
        });

        editButton.disabled = true;
        saveButton.disabled = false;
        syncProfileRoleCards();
    });
});
