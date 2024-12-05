const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    type: { type: String, required: true },
    duration: { type: Number, required: true },
    distance: { type: Number },
    avgSpeed: { type: Number },
    avgHeartRate: { type: Number },
    calories: { type: Number }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
