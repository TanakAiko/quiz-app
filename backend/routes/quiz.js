import { Router } from 'express';
import { distance } from 'fastest-levenshtein';
const router = Router();
import { readFileSync } from 'fs';

// Function to load JSON data from a file
function loadJSON(path) {
    try {
        const raw = readFileSync(path);
        return JSON.parse(raw);
    } catch (err) {
        console.error(`Error loading ${path}:`, err.message);
        return [];
    }
}

function isAnswerValid(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;

    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();

    console.log(`Checking answer: "${normalizedUser}" against correct answer: "${normalizedCorrect}"`);
    

    // ✅ Direct or partial match
    if (
        normalizedCorrect.includes(normalizedUser) ||
        normalizedUser.includes(normalizedCorrect)
    ) return true;

    // ✅ Match any part of the correct name (like "spike", "spiegel")
    const nameParts = normalizedCorrect.replace(/\s+/g, ' ').split(' ');

    for (const part of nameParts) {
        if (distance(normalizedUser, part) <= 2) {
            return true;
        }
    }
}

const challenges_l1 = loadJSON('./levels/1.json');
const challenges_l2 = loadJSON('./levels/2.json'); // ← this won't crash anymore
const challenges_l3 = loadJSON('./levels/3.json');

// Get a random challenge (without the answer)
router.get('/quiz', (_, res) => {
    const random1 = Math.floor(Math.random() * challenges_l1.length);
    const random2 = Math.floor(Math.random() * challenges_l2.length);
    const random3 = Math.floor(Math.random() * challenges_l3.length);

    const { correct: c1, ...safeChallenge1 } = challenges_l1[random1];
    const { correct: c2, ...safeChallenge2 } = challenges_l2[random2];
    const { correct: c3, ...safeChallenge3 } = challenges_l3[random3];

    const challenges = {
        level1: safeChallenge1,
        level2: safeChallenge2,
        level3: safeChallenge3
    };

    res.json(challenges);
});

router.post('/quiz', (req, res) => {
    const { id, level, answer } = req.body;

    const challengeSet = {
        1: challenges_l1,
        2: challenges_l2,
        3: challenges_l3,
    };

    const challenges = challengeSet[level];
    if (!challenges) {
        return res.status(400).json({ success: false, message: 'Invalid level' });
    }

    const challenge = challenges.find(ch => ch.id === id);
    if (!challenge) {
        return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    console.log(`challenge:`, challenge);
    console.log(`Received answer for challenge ${id} at level ${level}:`, answer);

    let isCorrect = false;

    // Check if the answer is correct
    switch (challenge.type) {
        case 'image-select':
            if (!Array.isArray(answer) || answer.length === 0) {
                return res.status(400).json({ success: false, message: 'Answer must be a non-empty array.' });
            }
            isCorrect = JSON.stringify([...answer].sort()) === JSON.stringify([...challenge.correct].sort());
            break;

        case 'math':
            if (typeof answer !== 'number') {
                return res.status(400).json({ success: false, message: 'Answer must be a number.' });
            }
            isCorrect = challenge.correct === answer;
            break;

        case 'text':
            if (typeof answer !== 'string' || answer.trim() === '') {
                return res.status(400).json({ success: false, message: 'Answer must be a non-empty string.' });
            }
            isCorrect = challenge.correct.toLowerCase() === answer.toLowerCase();
            break;

        default:
            return res.status(400).json({ success: false, message: 'Unknown challenge type.' });
    }

    res.json({ success: isCorrect });
});

let quotes = []; // Holds the 5 quotes with authors

router.get('/quotes', async (_, res) => {
    console.log(`Fetching 5 quotes...`);
    console.log(process.env.RAPID_API_KEY);

    try {
        const fetchedQuotes = [];

        for (let i = 0; i < 5; i++) {
            const response = await fetch('https://quotes-api12.p.rapidapi.com/quotes/anime', {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                    'X-RapidAPI-Host': 'quotes-api12.p.rapidapi.com'
                }
            });

            const data = await response.json();
            if (data && data.quote && data.author) {
                fetchedQuotes.push(data);
            }
        }

        quotes = fetchedQuotes; // Store the full quotes for answer validation

        // Remove the author before sending to frontend
        const safeQuotes = quotes.map((q, i) => ({
            id: i,
            quote: q.quote
        }));

        console.log(`Fetched ${safeQuotes.length} quotes successfully`);
        res.json(safeQuotes);
    } catch (err) {
        console.error(`Error fetching quotes:`, err.message);
        res.status(200).json(quotes.map((q, i) => ({ id: i, quote: q.quote })));
    }
});


router.post('/quotes', (req, res) => {
    const { id, answer } = req.body;
    console.log(`Received answer for quote ID ${id}:`, answer);
    console.log(`Quotes available:`, quotes);
    
    if (!answer || id == null || id < 0 || id >= quotes.length) {
        console.log(`Invalid request data:`, req.body);
        return res.status(400).json({ error: 'Missing data' });
    }

    const isCorrect = isAnswerValid(answer, quotes[id].author);

    res.json({
        success: isCorrect,
        message: isCorrect ? '✅ Good answer!' : '❌ Try again!'
    });
});

export default router;