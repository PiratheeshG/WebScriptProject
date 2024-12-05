// Base URL for API
const API_BASE = '/api'; // Relative path since frontend and backend are on the same domain

// User Authentication Logic

async function register() {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    if (!email || !password) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.msg);
            window.location.href = "login.html";
        } else {
            alert(data.msg);
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred during registration.");
    }
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            // Store user info in localStorage
            localStorage.setItem("loggedInUser", JSON.stringify({ email: data.email, userId: data.userId }));
            alert(data.msg);
            window.location.href = "index.html";
        } else {
            alert(data.msg);
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred during login.");
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");
    alert("You have been logged out.");
    window.location.href = "login.html";
}

function checkAuth() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const logoutLink = document.getElementById("logout-link");

    if (loggedInUser) {
        loginLink.style.display = "none";
        registerLink.style.display = "none";
        logoutLink.style.display = "inline";
    } else {
        loginLink.style.display = "inline";
        registerLink.style.display = "inline";
        logoutLink.style.display = "none";
    }
}

checkAuth();

// Workout Management Logic

let workouts = [];
let editIndex = -1;

function navigateToLog() {
    document.getElementById("log-form").style.display = "block";
    document.getElementById("workout-log").style.display = "block";
}

async function fetchWorkouts() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    try {
        const response = await fetch(`${API_BASE}/workouts`, {
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': loggedInUser.userId
            }
        });

        const data = await response.json();
        if (response.ok) {
            workouts = data;
            displayWorkouts();
        } else {
            alert(data.msg);
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while fetching workouts.");
    }
}

async function addWorkout() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("You must be logged in to add workouts.");
        window.location.href = "login.html";
        return;
    }

    const workout = {
        date: document.getElementById("date").value,
        type: document.getElementById("type").value,
        duration: parseInt(document.getElementById("duration").value),
        distance: parseFloat(document.getElementById("distance").value) || 0,
        avgSpeed: parseFloat(document.getElementById("avg-speed").value) || 0,
        avgHeartRate: parseInt(document.getElementById("avg-heart-rate").value) || 0,
        calories: parseInt(document.getElementById("calories").value) || 0
    };

    if (!workout.date || !workout.type || !workout.duration) {
        alert("Please fill out the required fields (date, type, duration).");
        return;
    }

    try {
        if (editIndex === -1) {
            // Add new workout
            const response = await fetch(`${API_BASE}/workouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': loggedInUser.userId
                },
                body: JSON.stringify(workout)
            });

            const data = await response.json();
            if (response.ok) {
                workouts.unshift(data);
                displayWorkouts();
                document.getElementById("cardio-log-form").reset();
                navigateToLog();
                alert("Workout logged successfully!");
            } else {
                alert(data.msg);
            }
        } else {
            // Update existing workout
            const workoutId = workouts[editIndex]._id;
            const response = await fetch(`${API_BASE}/workouts/${workoutId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': loggedInUser.userId
                },
                body: JSON.stringify(workout)
            });

            const data = await response.json();
            if (response.ok) {
                workouts[editIndex] = data;
                displayWorkouts();
                document.getElementById("cardio-log-form").reset();
                editIndex = -1;
                document.getElementById("add-button").textContent = "Log Workout";
                navigateToLog();
                alert("Workout updated successfully!");
            } else {
                alert(data.msg);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while logging the workout.");
    }
}

function displayWorkouts() {
    const workoutTable = document.getElementById("workout-table").getElementsByTagName("tbody")[0];
    workoutTable.innerHTML = "";

    workouts.forEach((workout, index) => {
        const row = workoutTable.insertRow();
        row.innerHTML = `
            <td>${new Date(workout.date).toLocaleDateString()}</td>
            <td>${workout.type}</td>
            <td>${workout.duration}</td>
            <td>${workout.distance || "-"}</td>
            <td>${workout.avgSpeed || "-"}</td>
            <td>${workout.avgHeartRate || "-"}</td>
            <td>${workout.calories || "-"}</td>
            <td>
                <button onclick="editWorkout('${workout._id}')">Edit</button>
                <button onclick="deleteWorkout('${workout._id}')">Delete</button>
            </td>
        `;
    });
}

async function deleteWorkout(id) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("You must be logged in to delete workouts.");
        window.location.href = "login.html";
        return;
    }

    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
        const response = await fetch(`${API_BASE}/workouts/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': loggedInUser.userId
            }
        });

        const data = await response.json();
        if (response.ok) {
            workouts = workouts.filter(workout => workout._id !== id);
            displayWorkouts();
            alert(data.msg);
        } else {
            alert(data.msg);
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while deleting the workout.");
    }
}

async function editWorkout(id) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("You must be logged in to edit workouts.");
        window.location.href = "login.html";
        return;
    }

    const workout = workouts.find(w => w._id === id);
    if (!workout) {
        alert("Workout not found.");
        return;
    }

    document.getElementById("date").value = new Date(workout.date).toISOString().substr(0, 10);
    document.getElementById("type").value = workout.type;
    document.getElementById("duration").value = workout.duration;
    document.getElementById("distance").value = workout.distance || '';
    document.getElementById("avg-speed").value = workout.avgSpeed || '';
    document.getElementById("avg-heart-rate").value = workout.avgHeartRate || '';
    document.getElementById("calories").value = workout.calories || '';

    editIndex = workouts.findIndex(w => w._id === id);
    document.getElementById("add-button").textContent = "Save Changes";
    navigateToLog();
}

// Fetch workouts when on workout_log.html
function checkAndProtectPage() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("You must be logged in to access this page.");
        window.location.href = "login.html";
    } else {
        checkAuth();
        fetchWorkouts();
    }
}

// Call fetchWorkouts if on workout_log.html
if (window.location.pathname.endsWith('workout_log.html')) {
    window.onload = checkAndProtectPage;
}



