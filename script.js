let workouts = JSON.parse(localStorage.getItem("workouts")) || [];

function navigateToLog() {
    document.getElementById("hero").style.display = "none";
    document.getElementById("log-form").style.display = "block";
}

function addWorkout() {
    const workout = {
        date: document.getElementById("date").value,
        type: document.getElementById("type").value,
        duration: document.getElementById("duration").value,
        distance: document.getElementById("distance").value,
        avgSpeed: document.getElementById("avg-speed").value,
        avgHeartRate: document.getElementById("avg-heart-rate").value,
        calories: document.getElementById("calories").value
    };

    workouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(workouts)); 
    displayWorkouts();
    document.getElementById("cardio-log-form").reset(); 
}

function displayWorkouts() {
    const workoutTable = document.getElementById("workout-table").getElementsByTagName("tbody")[0];
    workoutTable.innerHTML = "";

    workouts.forEach((workout, index) => {
        const row = workoutTable.insertRow();
        row.innerHTML = `
            <td>${workout.date}</td>
            <td>${workout.type}</td>
            <td>${workout.duration}</td>
            <td>${workout.distance}</td>
            <td>${workout.avgSpeed}</td>
            <td>${workout.avgHeartRate}</td>
            <td>${workout.calories}</td>
            <td>
                <button onclick="editWorkout(${index})">Edit</button>
                <button onclick="deleteWorkout(${index})">Delete</button>
            </td>
        `;
    });
}


function deleteWorkout(index) {
    workouts.splice(index, 1);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    displayWorkouts();
}


function editWorkout(index) {
    alert("Edit feature coming soon!");
}


displayWorkouts();
