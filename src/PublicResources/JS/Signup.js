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
        var roleInputs = card.querySelectorAll('input[type="radio"]');
        var availabilityInput = card.querySelector('input[name$="CarAvailability"]');
        var intentInput = card.querySelector('input[name$="CarpoolingIntent"]');
        var seatsInput = card.querySelector('input[name$="SeatsOffered"]');

        function syncRole() {
            var selected = card.querySelector('input[type="radio"]:checked');
            var isDriver = selected && selected.value === "driver";
            availabilityInput.value = isDriver ? "true" : "false";
            intentInput.value = isDriver ? "true" : "false";
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
