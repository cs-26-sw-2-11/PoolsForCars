
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
    var carpoolInputs = card.querySelectorAll('input[name$="CarpoolingIntent"]');
    var pickupInput = card.querySelector('input[name$="PickupPoint"]');
    var destinationInput = card.querySelector('input[name$="Destination"]');
    var arrivalInput = card.querySelector('input[name$="TimeOfArrival"]');

    function syncRole() {
        var carpoolChoice = card.querySelector('input[name$="CarpoolingIntent"]:checked');
        var wantsToCarpool = carpoolChoice && carpoolChoice.value === "true";
        var selected = card.querySelector('input[name$="RideRole"]:checked');
        var isDriver = selected && selected.value === "driver";

        availabilityInput.value = isDriver && wantsToCarpool ? "true" : "false";
        seatsInput.disabled = !isDriver || !wantsToCarpool;

        if (!isDriver) {
            seatsInput.value = "0";
        }
    }

    function syncCarpoolIntent() {
        var selected = card.querySelector('input[name$="CarpoolingIntent"]:checked');
        var wantsToCarpool = selected && selected.value === "true";

        roleInputs.forEach(function (input) {
            input.disabled = !wantsToCarpool;
        });

        pickupInput.disabled = !wantsToCarpool;
        destinationInput.disabled = !wantsToCarpool;
        arrivalInput.disabled = !wantsToCarpool;

        pickupInput.required = wantsToCarpool;
        destinationInput.required = wantsToCarpool;
        arrivalInput.required = wantsToCarpool;

        if (!wantsToCarpool) {
            seatsInput.value = "0";
            pickupInput.value = "";
            destinationInput.value = "";
            arrivalInput.value = "";
            card.classList.add("day-card--not-carpooling");
        } else {
            card.classList.remove("day-card--not-carpooling");
        }

        syncRole();
    }

    roleInputs.forEach(function (input) {
        input.addEventListener("change", syncRole);
    });

    carpoolInputs.forEach(function (input) {
        input.addEventListener("change", syncCarpoolIntent);
    });

    syncCarpoolIntent();
    syncRole();
});