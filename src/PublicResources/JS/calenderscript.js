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

let calenderData = {};

getData();

// ===== CHANGE BETWEEN STEPS =====
/*function goToStep(stepNumber) {
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
*/
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
    updateData();
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
let currentWeekStart = getFirstDayOfWeek(currentDate);

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


// Function to get the start of the week (Monday)
function getFirstDayOfWeek(date) {
    const dayNum = (date.getDay() + 6) % 7;
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - dayNum);
    return firstDay;

  
}

function getLastDayOfWeek(date) {
    const dayNum = (date.getDay() + 6) % 7;
    const lastDay = new Date(date);
    lastDay.setDate(date.getDate() + (4 - dayNum));
    return lastDay;

    
}
// Function to format date as "Mon DD, YYYY"
function formatDate(date) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);

    
}

// Function to format week range
function formatWeek(weekStart) {
    const weekEnd = getLastDayOfWeek(weekStart);
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;

    
}

// Update the display of current date and week
function Display() {
    document.getElementById('current-date').textContent = formatDate(currentDate);
    document.getElementById('current-week').textContent = 
        `Week ${getDateWeek(currentDate)}: ${formatWeek(currentWeekStart)}`;

        updateData();
    
}

// Navigate to previous week
function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    currentDate = new Date(currentWeekStart); // Set current date to start of the week
    Display();

    updateData();
}

// Navigate to next week
function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    currentDate = new Date(currentWeekStart); // Set current date to start of the week
    Display();

    updateData();
}

// Navigate to previous date
function previousDate() {
    currentDate.setDate(currentDate.getDate() - 1);
    currentDate = WannaSkipWeekend(currentDate, -1);
    currentWeekStart = getFirstDayOfWeek(currentDate);
    Display();

    updateData();
}

// Navigate to next date
function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate = WannaSkipWeekend(currentDate, 1);
    currentWeekStart = getFirstDayOfWeek(currentDate);
    Display();

    updateData();
}

// Initialize the calendar display when the page loads
document.addEventListener('DOMContentLoaded', function() {
    Display();
});

function WannaSkipWeekend(date, MoveDayForward) {
    let day = date.getDay();
    if (day === 6) {
        date.setDate(date.getDate() + (MoveDayForward === 1 ? 2 : -1)); // This means that we dont want saturday, and now we are gonna do the same to sunday
    } else if (day === 0) {
        date.setDate(date.getDate() + (MoveDayForward === 1 ? 1 : -2));

    }
    return date;

  
}
/*async function getData() {
    const url = "/calendar/0";

    try { 
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Calender get request failed");

        }


        calenderData = await response.json();
        console.log(calenderData);
 
        fillFromFetch(calenderData[20].days[wednesday]);

    } catch (error) {
        console.error("Error fetching calendar data:", error);
        
    }
    updateData();
}
*/
async function getData() {
    const url = "/calendar/0";

    try { 
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Calendar get request failed");
        }

        const result = await response.json();

        console.log(result);

        // 🔑 dynamically calculate week number
        const currentWeek = getDateWeek(currentDate);

        console.log("Current week:", currentWeek);

        // 🔑 use calculated week
        const weekData = result[currentWeek];

        if (!weekData) {
            console.warn("Week does not exist yet");
            return;
        }

        // 🔑 dynamically calculate weekday
        const dayName = currentDate.toLocaleDateString(
            "en-US",
            { weekday: "long" }
        );

        console.log("Current day:", dayName);

        const dayData = weekData.days?.[dayName];

        if (!dayData) {
            console.warn("Day data missing");
            return;
        }

        fillFromFetch(dayData);

    } catch (error) {
        console.error("Error fetching calendar data:", error);
    }
}
function fillFromFetch(dayData) {
    if (!dayData) return;

    bookingInfo.pickup = dayData.pickupPoint.address ||"";
    bookingInfo.destination = dayData.destination.address ||"";
    bookingInfo.arrivalTime = dayData.timeOfArrival ||"";
    bookingInfo.seats = dayData.seatsAvailable ||"";
    
    document.getElementById("pickup").value = bookingInfo.pickup;
    document.getElementById("destination").value = bookingInfo.destination;
    document.getElementById("arrival-time").value = bookingInfo.arrivalTime;
    document.getElementById("seats").value = bookingInfo.seats;

    
}

async function loadInitialData() {
    const repponse = await fetch("/calendar/0");

    if (!response.ok) {
        throw new Error("Calender get request failed");
    }
    calenderData = await response.json();

    updateData();

}
/*
function findWeekIndexByDate(data, date) {
    
    return data.findIndex(week => {

        const weekStart = new Date(week.weekStart);
        const weekEnd = new Date(week.weekEnd);

        return date >= weekStart && date <= weekEnd;
    });

    updateData();
}    
*/    


/*async function fetchOrCreateWeekData(date) {
    let weekIndex = findWeekIndexByDate(calenderData, date);
    
    if (weekIndex === -1) {
        return calenderData[weekIndex];
    }
    const response = await fetch(`/calendar/${weekIndex}`);
    
    if (!response.ok) {
        throw new Error("Failed to fetch week data");
    }
    const newWeek = await response.json();
    calenderData[weekIndex] = newWeek;
    return newWeek;

    updateData();
}

async function updateData() {
    try  {
        const weekData = await fetchOrCreateWeekData(currentDate);

        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

        const dayData = weekData.days[dayName] || {};

        fillFromFetch(dayData);
        
    } catch (error) {
        console.error("Error updating calendar data:", error);
    }
}
*/
// ===== FETCH OR CREATE WEEK DATA =====
async function fetchOrCreateWeekData(date) {
    // Step 1: Calculate which week number this date belongs to
    const weekNumber = getDateWeek(date);
    
    // Step 2: Check if week already exists in cache
    if (calenderData[weekNumber]) {
        console.log(`Week ${weekNumber} found in cache`);
        return calenderData[weekNumber];
    }
    
    // Step 3: Week doesn't exist in cache, fetch from backend
    console.log(`Week ${weekNumber} not in cache, fetching from backend...`);
    try {
        const userId = 0; // Get this from cookie or somewhere
        const response = await fetch(`/calendar/${userId}/${weekNumber}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch week ${weekNumber}`);
        }
        
        const weekData = await response.json();
        
        // Step 4: Save to cache for next time
        calenderData[weekNumber] = weekData;
        console.log(`Week ${weekNumber} cached successfully`);
        
        return weekData;
        
    } catch (error) {
        console.error(`Error fetching week ${weekNumber}:`, error);
        return null;
    }
}

// ===== UPDATE DATA =====
async function updateData() {
    try {
        // Step 1: Fetch or get week data from cache
        const weekData = await fetchOrCreateWeekData(currentDate);
        
        if (!weekData) {
            console.warn("Could not load week data");
            return;
        }
        
        // Step 2: Get current day name (Monday, Tuesday, etc)
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Step 3: Get the specific day's data from the week
        const dayData = weekData.days?.[dayName];
        
        if (!dayData) {
            console.warn(`No data for ${dayName}`);
            return;
        }
        
        // Step 4: Fill the form with this day's data
        fillFromFetch(dayData);
        
    } catch (error) {
        console.error("Error updating calendar data:", error);
    }
}