async function getData() {
    var url = "/users/" + currentUserId;

    try {
        var response = await fetch(url);

        if (!response.ok) {
            throw new Error("response status " + response.status);
        }

        var user = await response.json();
        currentUser = user;

        fillProfile(user);
        updateCarpoolFields();
    } catch (error) {
        console.error(error.message);
    }
}


var profileForm = document.getElementById("profileForm");
var editButton = document.getElementById("editProfile");
var saveButton = document.getElementById("saveProfile");
var profileIsEditing = false;
var currentUser = null;
var currentUserId = 0;

function setValue(id, value) {
    var input = document.getElementById(id);

    if (input) {
        input.value = value || "";
    }
}

function getValue(id) {
    var input = document.getElementById(id);

    if (input) {
        return input.value;
    }

    return "";
}

function isChecked(id) {
    var input = document.getElementById(id);

    if (input) {
        return input.checked;
    }

    return false;
}

function updateAddress(place, address) {
    if (!place) {
        return {
            address: address,
            coordinates: []
        };
    }

    if (typeof place === "string") {
        return address;
    }

    return {
        address: address,
        coordinates: place.coordinates
    };
}

function fillProfile(user) {
    var {
        firstName,
        lastName,
        phoneNumber,
        schedule
    } = user;

    var { days } = schedule;

    setValue("profileFirstName", firstName);
    setValue("profileLastName", lastName);
    setValue("profilePhone", phoneNumber);

    fillDay(days.Monday, "mondayCarpoolYes", "mondayCarpoolNo", "mondayDriver", "mondayPassenger", "mondaySeats", "mondayPickup", "mondayDestination", "mondayArrival");
    fillDay(days.Tuesday, "tuesdayCarpoolYes", "tuesdayCarpoolNo", "tuesdayDriver", "tuesdayPassenger", "tuesdaySeats", "tuesdayPickup", "tuesdayDestination", "tuesdayArrival");
    fillDay(days.Wednesday, "wednesdayCarpoolYes", "wednesdayCarpoolNo", "wednesdayDriver", "wednesdayPassenger", "wednesdaySeats", "wednesdayPickup", "wednesdayDestination", "wednesdayArrival");
    fillDay(days.Thursday, "thursdayCarpoolYes", "thursdayCarpoolNo", "thursdayDriver", "thursdayPassenger", "thursdaySeats", "thursdayPickup", "thursdayDestination", "thursdayArrival");
    fillDay(days.Friday, "fridayCarpoolYes", "fridayCarpoolNo", "fridayDriver", "fridayPassenger", "fridaySeats", "fridayPickup", "fridayDestination", "fridayArrival");
}
function setChecked(id, shouldBeChecked) {
    var input = document.getElementById(id);

    if (input) {
        input.checked = shouldBeChecked;
    }
}

function getAddress(place) {
    if (!place) {
        return "";
    }

    if (typeof place === "string") {
        return place;
    }

    return place.address || "";
}

function fillDay(day, carpoolYesId, carpoolNoId, driverId, passengerId, seatsId, pickupId, destinationId, arrivalId) {
    if (!day) {
        return;
    }

    var {
        carpoolingIntent,
        carAvailability,
        seatsOffered,
        pickupPoint,
        destination,
        timeOfArrival
    } = day;

    setChecked(carpoolYesId, carpoolingIntent === true);
    setChecked(carpoolNoId, carpoolingIntent === false);
    setChecked(driverId, carAvailability === true);
    setChecked(passengerId, carAvailability === false);
    setValue(seatsId, seatsOffered);
    setValue(pickupId, getAddress(pickupPoint));
    setValue(destinationId, getAddress(destination));
    setValue(arrivalId, timeOfArrival);
}

function updateMonday(day) {
    day.carpoolingIntent = isChecked("mondayCarpoolYes");
    day.carAvailability = isChecked("mondayDriver");
    day.seatsOffered = Number(getValue("mondaySeats"));
    day.pickupPoint = updateAddress(day.pickupPoint, getValue("mondayPickup"));
    day.destination = updateAddress(day.destination, getValue("mondayDestination"));
    day.timeOfArrival = getValue("mondayArrival");
}

function updateTuesday(day) {
    day.carpoolingIntent = isChecked("tuesdayCarpoolYes");
    day.carAvailability = isChecked("tuesdayDriver");
    day.seatsOffered = Number(getValue("tuesdaySeats"));
    day.pickupPoint = updateAddress(day.pickupPoint, getValue("tuesdayPickup"));
    day.destination = updateAddress(day.destination, getValue("tuesdayDestination"));
    day.timeOfArrival = getValue("tuesdayArrival");
}

function updateWednesday(day) {
    day.carpoolingIntent = isChecked("wednesdayCarpoolYes");
    day.carAvailability = isChecked("wednesdayDriver");
    day.seatsOffered = Number(getValue("wednesdaySeats"));
    day.pickupPoint = updateAddress(day.pickupPoint, getValue("wednesdayPickup"));
    day.destination = updateAddress(day.destination, getValue("wednesdayDestination"));
    day.timeOfArrival = getValue("wednesdayArrival");
}

function updateThursday(day) {
    day.carpoolingIntent = isChecked("thursdayCarpoolYes");
    day.carAvailability = isChecked("thursdayDriver");
    day.seatsOffered = Number(getValue("thursdaySeats"));
    day.pickupPoint = updateAddress(day.pickupPoint, getValue("thursdayPickup"));
    day.destination = updateAddress(day.destination, getValue("thursdayDestination"));
    day.timeOfArrival = getValue("thursdayArrival");
}

function updateFriday(day) {
    day.carpoolingIntent = isChecked("fridayCarpoolYes");
    day.carAvailability = isChecked("fridayDriver");
    day.seatsOffered = Number(getValue("fridaySeats"));
    day.pickupPoint = updateAddress(day.pickupPoint, getValue("fridayPickup"));
    day.destination = updateAddress(day.destination, getValue("fridayDestination"));
    day.timeOfArrival = getValue("fridayArrival");
}

function updateScheduleFromForm() {
    var { days } = currentUser.schedule;

    updateMonday(days.Monday);
    updateTuesday(days.Tuesday);
    updateWednesday(days.Wednesday);
    updateThursday(days.Thursday);
    updateFriday(days.Friday);
}


function setProfileFieldsDisabled(disabled) {
    profileIsEditing = !disabled;

    var fields = profileForm.querySelectorAll("input, select, textarea");

    fields.forEach(function (field) {
        field.disabled = disabled;
    });

    updateCarpoolFields();
}

function showSelectedDay() {
    var selectedDay = document.querySelector('input[name="signupSelectedDay"]:checked').value;
    var cards = document.querySelectorAll("[data-day-card]");

    cards.forEach(function (card) {
        if (card.dataset.dayCard === selectedDay) {
            card.hidden = false;
        } else {
            card.hidden = true;
        }
    });
}

function updateOneCard(card) {
    var carpoolYes = card.querySelector('input[value="true"][name$="CarpoolingIntent"]');
    var driver = card.querySelector('input[value="true"][name$="CarAvailability"]');
    var carpoolChoices = card.querySelectorAll('input[name$="CarpoolingIntent"]');
    var roleChoices = card.querySelectorAll('input[name$="CarAvailability"]');
    var seats = card.querySelector('input[name$="SeatsOffered"]');
    var pickup = card.querySelector('input[name$="PickupPoint"]');
    var destination = card.querySelector('input[name$="Destination"]');
    var arrival = card.querySelector('input[name$="TimeOfArrival"]');

    var wantsToCarpool = carpoolYes.checked;
    var isDriver = driver.checked;

    carpoolChoices.forEach(function (choice) {
        choice.disabled = !profileIsEditing;
    });

    roleChoices.forEach(function (choice) {
        choice.disabled = !profileIsEditing || !wantsToCarpool;
    });

    seats.disabled = !profileIsEditing || !wantsToCarpool || !isDriver;
    pickup.disabled = !profileIsEditing || !wantsToCarpool;
    destination.disabled = !profileIsEditing || !wantsToCarpool;
    arrival.disabled = !profileIsEditing || !wantsToCarpool;

    pickup.required = wantsToCarpool;
    destination.required = wantsToCarpool;
    arrival.required = wantsToCarpool;

    if (!wantsToCarpool || !isDriver) {
        seats.value = "0";
    }

    if (!wantsToCarpool) {
        pickup.value = "";
        destination.value = "";
        arrival.value = "";
        card.classList.add("day-card--not-carpooling");
    } else {
        card.classList.remove("day-card--not-carpooling");
    }
}

function updateCarpoolFields() {
    var cards = document.querySelectorAll("[data-role-card]");

    cards.forEach(function (card) {
        updateOneCard(card);
    });
}

window.addEventListener("DOMContentLoaded", function () {
    if (!profileForm || !editButton || !saveButton) {
        return;
    }

    getData();
    showSelectedDay();
    setProfileFieldsDisabled(true);

    editButton.disabled = false;
    saveButton.disabled = true;

    var dayChoices = document.querySelectorAll('input[name="signupSelectedDay"]');

    dayChoices.forEach(function (choice) {
        choice.addEventListener("change", showSelectedDay);
    });

    var carpoolChoices = document.querySelectorAll('input[name$="CarpoolingIntent"], input[name$="CarAvailability"]');

    carpoolChoices.forEach(function (choice) {
        choice.addEventListener("change", updateCarpoolFields);
    });

    editButton.addEventListener("click", function () {
        setProfileFieldsDisabled(false);
        editButton.disabled = true;
        saveButton.disabled = false;
    });

    profileForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        var formData = new FormData(profileForm);
        var lookingForGroups = false;
        var schedule = null;

        if (currentUser) {
            lookingForGroups = currentUser.lookingForGroups;
            updateScheduleFromForm();
            schedule = currentUser.schedule;
        }

        try {
            await fetch("/profile/" + currentUserId, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: formData.get("firstName"),
                    lastName: formData.get("lastName"),
                    phoneNumber: formData.get("phoneNumber"),
                    lookingForGroups: lookingForGroups,
                    schedule: schedule
                })
            });

            setProfileFieldsDisabled(true);
            editButton.disabled = false;
            saveButton.disabled = true;
        } catch (error) {
            console.error(error.message);
            saveButton.disabled = false;
        }
    });
});
