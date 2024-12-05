const express = require('express');
const router = express.Router();
const Workout = require('../models/workout');
const User = require('../models/user');

// Middleware to check authentication
const authenticate = async (req, res, next) => {
    const userId = req.header('x-user-id');
    if (!userId) {
        return res.status(401).json({ msg: 'No user ID provided' });
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ msg: 'Invalid user ID' });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get all workouts for a user
router.get('/', authenticate, async (req, res) => {
    try {
        const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1 });
        res.json(workouts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add a new workout
router.post('/', authenticate, async (req, res) => {
    const { date, type, duration, distance, avgSpeed, avgHeartRate, calories } = req.body;
    try {
        const newWorkout = new Workout({
            user: req.user._id,
            date,
            type,
            duration,
            distance,
            avgSpeed,
            avgHeartRate,
            calories
        });
        const workout = await newWorkout.save();
        res.json(workout);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update an existing workout
router.put('/:id', authenticate, async (req, res) => {
    const { date, type, duration, distance, avgSpeed, avgHeartRate, calories } = req.body;
    const workoutFields = {};
    if (date) workoutFields.date = date;
    if (type) workoutFields.type = type;
    if (duration) workoutFields.duration = duration;
    if (distance) workoutFields.distance = distance;
    if (avgSpeed) workoutFields.avgSpeed = avgSpeed;
    if (avgHeartRate) workoutFields.avgHeartRate = avgHeartRate;
    if (calories) workoutFields.calories = calories;

    try {
        let workout = await Workout.findById(req.params.id);
        if (!workout) {
            return res.status(404).json({ msg: 'Workout not found' });
        }
        if (workout.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        workout = await Workout.findByIdAndUpdate(
            req.params.id,
            { $set: workoutFields },
            { new: true }
        );

        res.json(workout);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a workout
router.delete('/:id', authenticate, async (req, res) => {
    try {
        let workout = await Workout.findById(req.params.id);
        if (!workout) {
            return res.status(404).json({ msg: 'Workout not found' });
        }
        if (workout.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        await Workout.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Workout removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
