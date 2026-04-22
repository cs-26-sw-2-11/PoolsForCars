// ===== SIMPLE GLOBAL VARIABLES TO STORE USER DATA =====
let bookingInfo = {
    pickup: "",
    destination: "",
    arrivalTime: "",
    numDestinations: "",
    cancelTrip: false,
    role: "passenger",
    carAvailable: "no",
    seats: "",
    destination2: ""
};

let currentStep = 1;


// ===== CHANGE BETWEEN STEPS =====
function goToStep(stepNumber) {
    // Hide all steps
    document.getElementById("step-1").style.display = "none";
    document.getElementById("step-2").style.display = "none";
    document.getElementById("step-3").style.display = "none";
    document.getElementById("step-4").style.display = "none";

    // Show the step we want
    document.getElementById("step-" + stepNumber).style.display = "block";

    // Remember which step we are on
    currentStep = stepNumber;

    // If going to step 4, show the summary
    if (stepNumber === 4) {
        showSummary();
    }
}

// ===== SAVE DATA FROM STEP 1 =====
function goToStep(stepNumber) {
    if (currentStep === 1) {
        // Get values from the form inputs
        bookingInfo.pickup = document.getElementById("pickup").value;
        bookingInfo.destination = document.getElementById("destination").value;
        bookingInfo.arrivalTime = document.getElementById("arrival-time").value;
        bookingInfo.numDestinations = document.getElementById("num-destinations").value;
    }

    if (currentStep === 2) {
        // Get values from step 2
        bookingInfo.cancelTrip = document.getElementById("cancel-trip").checked;
        bookingInfo.role = document.querySelector('input[name="role"]:checked').value;
    }

    if (currentStep === 3) {
        // Get values from step 3
        bookingInfo.carAvailable = document.querySelector('input[name="car-available"]:checked').value;
        bookingInfo.seats = document.getElementById("seats").value;
        bookingInfo.destination2 = document.getElementById("destination-2").value;
    }

    // Hide all steps
    document.getElementById("step-1").style.display = "none";
    document.getElementById("step-2").style.display = "none";
    document.getElementById("step-3").style.display = "none";
    document.getElementById("step-4").style.display = "none";

    // Show the step we want
    document.getElementById("step-" + stepNumber).style.display = "block";

    // Remember which step we are on
    currentStep = stepNumber;

    // If going to step 4, show the summary
    if (stepNumber === 4) {
        showSummary();
    }
}

// ===== SHOW SUMMARY ON STEP 4 =====
function showSummary() {
    // Put the saved data into the summary
    document.getElementById("summary-pickup").textContent = bookingInfo.pickup;
    document.getElementById("summary-destination").textContent = bookingInfo.destination;
    document.getElementById("summary-time").textContent = bookingInfo.arrivalTime;
    document.getElementById("summary-role").textContent = bookingInfo.role;
    document.getElementById("summary-seats").textContent = bookingInfo.seats;
}

// ===== SEND DATA TO BACKEND =====
function submitBooking() {
    // Make sure we saved step 3 data
    bookingInfo.carAvailable = document.querySelector('input[name="car-available"]:checked').value;
    bookingInfo.seats = document.getElementById("seats").value;
    bookingInfo.destination2 = document.getElementById("destination-2").value;

    // Print the data we're sending (so you can see it in console)
    console.log("SENDING THIS DATA TO BACKEND:", bookingInfo);

    // Create a message to send
    let dataToSend = {
        pickup_location: bookingInfo.pickup,
        destination: bookingInfo.destination,
        arrival_time: bookingInfo.arrivalTime,
        num_destinations: bookingInfo.numDestinations,
        cancel_trip: bookingInfo.cancelTrip,
        role: bookingInfo.role,
        car_available: bookingInfo.carAvailable,
        seats_available: bookingInfo.seats,
        booked_at: new Date().toISOString()
    };

    // Send to backend - CHANGE THIS URL TO YOUR BACKEND ADDRESS
    fetch("http://localhost:5000/api/bookings", {
        method: "POST",  // We are sending (POST) not receiving
        headers: {
            "Content-Type": "application/json"  // Tell backend it's JSON
        },
        body: JSON.stringify(dataToSend)  // Convert to JSON text
    })
    .then(response => response.json())  // Get response back
    .then(data => {
        console.log("SUCCESS! Backend said:", data);
        showSuccessMessage();
    })
    .catch(error => {
        console.log("ERROR! Something went wrong:", error);
        alert("Error booking ride. Check your backend is running!");
    });
}

// ===== SHOW SUCCESS MESSAGE =====
function showSuccessMessage() {
    // Hide all steps
    document.getElementById("step-1").style.display = "none";
    document.getElementById("step-2").style.display = "none";
    document.getElementById("step-3").style.display = "none";
    document.getElementById("step-4").style.display = "none";
    
    // Show success message
    document.getElementById("success-message").style.display = "block";
}
function goFromStepFour() {
    if (bookingInfo.role === "passenger") {
        goToStep(2);
    } else {
        goToStep(3);
}

}
// ===== START OVER - RESET EVERYTHING =====
function startOver() {
    // Clear all the data
    bookingInfo = {
        pickup: "",
        destination: "",
        arrivalTime: "",
        numDestinations: "",
        cancelTrip: false,
        role: "passenger",
        carAvailable: "no",
        seats: "",
        destination2: ""
    };

    // Clear all form inputs
    document.getElementById("pickup").value = "";
    document.getElementById("destination").value = "";
    document.getElementById("arrival-time").value = "";
    document.getElementById("num-destinations").value = "";
    document.getElementById("cancel-trip").checked = false;
    document.getElementById("passenger").checked = true;
    document.getElementById("car-no").checked = true;
    document.getElementById("seats").value = "";
    document.getElementById("destination-2").value = "";

    // Hide success message
    document.getElementById("success-message").style.display = "none";

    // Go back to step 1
    goToStep(1);
}

function checkRoleandGo() {
    // Get the selected role
    const selectedRole = document.querySelector('input[name="role"]:checked').value;

    // If the user is a driver, go to step 3, otherwise go to step 4
    if (selectedRole === "driver") {
        goToStep(3);
    } else {
        goToStep(4);
    }
}

// ===== CALENDAR NAVIGATION FUNCTIONALITY =====

// Initialize current date and week
let currentDate = new Date();
let currentWeekStart = getWeekStart(currentDate);

// Function to get the start of the week (Monday)
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
}

// Function to format date as "Mon DD, YYYY"
function formatDate(date) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Function to format week range
function formatWeek(weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
}

// Update the display of current date and week
function Display() {
    document.getElementById('current-date').textContent = formatDate(currentDate);
    document.getElementById('current-week').textContent = formatWeek(currentWeekStart);
}

// Navigate to previous week
function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    currentDate = new Date(currentWeekStart); // Set current date to start of the week
    Display();
}

// Navigate to next week
function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    currentDate = new Date(currentWeekStart); // Set current date to start of the week
    Display();
}

// Navigate to previous date
function previousDate() {
    currentDate.setDate(currentDate.getDate() - 1);
    // If we've gone to a previous week, update the week start
    if (currentDate < currentWeekStart) {
        currentWeekStart = getWeekStart(currentDate);
    }
    Display();
}

// Navigate to next date
function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    // If we've gone to a next week, update the week start
    const nextWeekStart = getWeekStart(currentDate);
    if (nextWeekStart > currentWeekStart) {
        currentWeekStart = nextWeekStart;
    }
    Display();
}

// Initialize the calendar display when the page loads
document.addEventListener('DOMContentLoaded', function() {
    Display();
});

