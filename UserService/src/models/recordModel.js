const mongoose = require("mongoose");

// Chapter performance sub-schema
const chapterPerformanceSchema = new mongoose.Schema({
    chapter: { type: String, required: true },
    userPronounced: { 
        type: String, 
        required: false,  // Changed to false since it might be empty initially
        default: 'Not Attempted'
    },
    score: { 
        type: Number, 
        required: true,
        default: 0
    },
    attempts: { 
        type: Number, 
        required: true,
        default: 0
    },
    mistakes: [{ 
        type: String,
        default: [] 
    }],
    accuracy: { 
        type: Number, 
        required: true,
        default: 0
    },
    completedAt: { type: Date, default: Date.now }
});

// Summary sub-schema with defaults
const summarySchema = new mongoose.Schema({
    totalChapters: { 
        type: Number, 
        required: true,
        default: 0
    },
    completedChapters: { 
        type: Number, 
        required: true,
        default: 0
    },
    averageAccuracy: { 
        type: Number, 
        required: true,
        default: 0
    },
    strongestChapter: { 
        type: String, 
        required: false,
        default: 'Not Available'
    },
    weakestChapter: { 
        type: String, 
        required: false,
        default: 'Not Available'
    },
    improvementAreas: {
        type: [String],
        default: []
    }
});

// Main record schema
const recordSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        id: { type: String, required: true },
        userId: { 
            type: String, 
            required: true,
            index: true
        },
        date: { 
            type: Date, 
            default: Date.now,
            set: val => {
                if (typeof val === 'string') {
                    const [day, month, year] = val.split('/');
                    return new Date(year, month - 1, day);
                }
                return val;
            }
        },
        totalScore: { type: Number, default: 0 },
        maxPossibleScore: { type: Number, required: true },
        timeSpent: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 0 },
        chapter_performance: {
            type: [chapterPerformanceSchema],
            default: [],
            required: true
        },
        summary: { 
            type: summarySchema, 
            required: true,
            default: () => ({
                totalChapters: 0,
                completedChapters: 0,
                averageAccuracy: 0,
                strongestChapter: 'Not Available',
                weakestChapter: 'Not Available',
                improvementAreas: []
            })
        }
    },
    { 
        collection: "dyslexicRecords",
        timestamps: true
    }
);

// Add custom date format validation
recordSchema.path('date').validate(function(value) {
    if (!value) return true;
    return !isNaN(value.getTime());
}, 'Invalid date format');

const recordModel = mongoose.model("recordSchema", recordSchema);

module.exports = recordModel;