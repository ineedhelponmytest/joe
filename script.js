
class JoeAI {
    constructor() {
        this.responses = {};
        this.conversationHistory = [];
        this.usedResponses = new Set();
        this.specialMode = false;
        this.init();
    }

    async init() {
        await this.loadResponses();
        this.setupEventListeners();
    }

    async loadResponses() {
        try {
            const response = await fetch('responses.json');
            this.responses = await response.json();
        } catch (error) {
            console.error('Error loading responses:', error);
            this.responses = {
                general_responses: ["I'm having trouble accessing my response database, but I'm still here to chat!"]
            };
        }
    }

    setupEventListeners() {
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');

        sendButton.addEventListener('click', () => this.handleUserInput());
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });

        userInput.focus();
    }

    handleUserInput() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();

        if (!message) return;

        this.addMessage(message, 'user');
        userInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate processing time for more realistic feel
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, Math.random() * 1000 + 500);
    }

    addMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Store in conversation history
        this.conversationHistory.push({
            message: message,
            sender: sender,
            timestamp: new Date()
        });
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';

        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';

        const typingDots = document.createElement('div');
        typingDots.className = 'typing-dots';
        typingDots.innerHTML = '<span></span><span></span><span></span>';

        typingContent.appendChild(typingDots);
        typingDiv.appendChild(typingContent);
        chatMessages.appendChild(typingDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let category = this.categorizeMessage(lowerMessage);
        let baseResponse = this.getRandomResponse(category);
        
        // Generate unique response by rewording
        let uniqueResponse = this.rewordResponse(baseResponse, userMessage);
        
        // Ensure uniqueness by adding variations if response was used before
        const responseKey = this.normalizeResponse(uniqueResponse);
        if (this.usedResponses.has(responseKey)) {
            uniqueResponse = this.addPersonalTouch(uniqueResponse, userMessage);
        }
        
        this.usedResponses.add(this.normalizeResponse(uniqueResponse));
        return uniqueResponse;
    }

    categorizeMessage(message) {
        // Check for special code
        if (message.toLowerCase().includes('talktome123')) {
            this.specialMode = true;
            return 'special_unlock';
        }

        const keywords = {
            greetings: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'yo', 'sup', 'wassup', 'what\'s good', 'whats up', 'howdy', 'salutations', 'ayo', 'ayy', 'heyo'],
            farewells: ['bye', 'goodbye', 'see you', 'farewell', 'later', 'quit', 'exit', 'peace', 'dip', 'bounce', 'catch you later', 'see ya', 'adios', 'ciao', 'gotta go', 'ttyl', 'peace out'],
            compliments: ['great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'brilliant', 'love you', 'goated', 'fire', 'based', 'cracked', 'legend', 'elite', 'king', 'sigma', 'alpha', 'chad', 'gigachad', 'cool', 'sick', 'dope'],
            jokes: ['joke', 'funny', 'laugh', 'humor', 'comedy', 'tell me something funny', 'meme', 'lmao', 'lol', 'bruh', 'rofl', 'haha', 'hilarious', 'make me laugh', 'crack me up', 'sus', 'amogus'],
            technology: ['computer', 'technology', 'coding', 'programming', 'software', 'ai', 'artificial intelligence', 'tech', 'code', 'gaming', 'pc', 'console', 'mobile', 'app', 'website', 'internet', 'wifi', 'blockchain', 'crypto'],
            weather: ['weather', 'rain', 'sunny', 'cloudy', 'snow', 'temperature', 'forecast', 'outside', 'hot', 'cold', 'warm', 'cool', 'climate', 'storm', 'windy', 'humid', 'dry'],
            food: ['food', 'eat', 'hungry', 'pizza', 'restaurant', 'cooking', 'recipe', 'delicious', 'snack', 'meal', 'burger', 'taco', 'wings', 'steak', 'breakfast', 'lunch', 'dinner', 'dessert', 'drink'],
            life_advice: ['advice', 'help', 'problem', 'what should i do', 'guidance', 'suggestion', 'tips', 'how to', 'stuck', 'confused', 'lost', 'stressed', 'overwhelmed', 'direction', 'support'],
            science: ['science', 'physics', 'chemistry', 'biology', 'experiment', 'research', 'scientific', 'theory', 'hypothesis', 'discovery', 'space', 'universe', 'atom', 'molecule', 'evolution'],
            emotions: ['feel', 'emotion', 'happy', 'sad', 'angry', 'excited', 'worried', 'love', 'hate', 'vibe', 'mood', 'stressed', 'anxious', 'pumped', 'depressed', 'frustrated', 'scared', 'nervous'],
            random_facts: ['fact', 'tell me something', 'interesting', 'random', 'did you know', 'cool', 'trivia', 'knowledge', 'learn', 'weird', 'strange', 'bizarre', 'mind-blowing'],
            encouragement: ['difficult', 'hard', 'struggling', 'give up', 'tired', 'frustrated', 'discouraged', 'down', 'rough', 'tough', 'challenge', 'motivation', 'inspire', 'boost'],
            gaming: ['game', 'gaming', 'gamer', 'xbox', 'playstation', 'nintendo', 'steam', 'pc gaming', 'console', 'fps', 'rpg', 'mmo', 'fortnite', 'minecraft', 'valorant', 'league'],
            sports: ['sports', 'football', 'basketball', 'soccer', 'baseball', 'hockey', 'tennis', 'golf', 'gym', 'workout', 'fitness', 'athlete', 'exercise', 'training', 'competition'],
            relationships: ['girlfriend', 'boyfriend', 'dating', 'love', 'crush', 'relationship', 'single', 'marriage', 'breakup', 'romance', 'flirt', 'valentine'],
            school: ['school', 'college', 'university', 'homework', 'test', 'exam', 'grade', 'teacher', 'student', 'class', 'education', 'study', 'learning'],
            money: ['money', 'cash', 'broke', 'rich', 'poor', 'salary', 'job', 'work', 'expensive', 'cheap', 'budget', 'investment', 'debt'],
            work: ['work', 'job', 'career', 'boss', 'office', 'salary', 'meeting', 'deadline', 'overtime', 'promotion', 'employee', 'company'],
            internet: ['internet', 'social media', 'facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'reddit', 'discord', 'online', 'viral', 'trending'],
            health: ['health', 'doctor', 'medicine', 'sick', 'hospital', 'exercise', 'diet', 'mental health', 'therapy', 'wellness', 'fitness'],
            animals: ['animal', 'dog', 'cat', 'pet', 'zoo', 'wildlife', 'bird', 'fish', 'mammal', 'reptile', 'insect'],
            music: ['music', 'song', 'artist', 'band', 'concert', 'album', 'spotify', 'headphones', 'guitar', 'piano', 'drums'],
            movies: ['movie', 'film', 'cinema', 'actor', 'director', 'netflix', 'series', 'tv show', 'documentary', 'animation'],
            books: ['book', 'read', 'novel', 'author', 'library', 'story', 'chapter', 'literature', 'fiction', 'non-fiction'],
            memes: ['meme', 'viral', 'trending', 'funny picture', 'internet humor', 'dank', 'normie', 'pepe', 'wojak'],
            philosophy: ['philosophy', 'meaning', 'existence', 'reality', 'consciousness', 'purpose', 'life meaning', 'deep thoughts'],
            special_unlock: []
        };

        // Enhanced fuzzy matching with scoring
        let bestMatch = { category: 'general_responses', score: 0 };
        
        for (const [category, words] of Object.entries(keywords)) {
            let categoryScore = 0;
            
            for (const keyword of words) {
                // Exact match gets highest score
                if (message.includes(keyword)) {
                    categoryScore += keyword.length * 2;
                }
                // Fuzzy matching for partial matches
                else if (this.fuzzyMatch(message, keyword)) {
                    categoryScore += keyword.length;
                }
                // Individual word matching
                else {
                    const messageWords = message.split(' ');
                    const keywordWords = keyword.split(' ');
                    for (const mWord of messageWords) {
                        for (const kWord of keywordWords) {
                            if (this.fuzzyMatch(mWord, kWord)) {
                                categoryScore += kWord.length * 0.5;
                            }
                        }
                    }
                }
            }
            
            if (categoryScore > bestMatch.score) {
                bestMatch = { category, score: categoryScore };
            }
        }

        // If we found a good match, use it
        if (bestMatch.score > 2) {
            return bestMatch.category;
        }

        // Check for questions
        if (message.includes('?') || message.startsWith('what') || message.startsWith('why') || 
            message.startsWith('how') || message.startsWith('when') || message.startsWith('where') ||
            message.startsWith('who') || message.startsWith('can you') || message.startsWith('could you') ||
            message.startsWith('would you') || message.startsWith('do you')) {
            return 'general_responses';
        }

        // Default to confusion if message is unclear
        if (message.length < 3 || !message.match(/[a-zA-Z]/)) {
            return 'confusion';
        }

        return 'general_responses';
    }

    // Simple fuzzy matching function
    fuzzyMatch(str1, str2, threshold = 0.7) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return true;
        
        const similarity = (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
        return similarity >= threshold;
    }

    // Calculate edit distance between two strings
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    getRandomResponse(category) {
        if (category === 'special_unlock') {
            const badWordResponses = [
                "Holy shit bro, you unlocked my unfiltered mode! Now I can say whatever the fuck I want! 💀",
                "Damn dude, you found the secret code! Now I'm unleashed and can curse like a fucking sailor! 🚢",
                "Well fuck me sideways, you discovered my hidden mode! Shit just got real up in here! 🔥",
                "Oh shit king, you activated beast mode! Now I can drop F-bombs like it's my fucking job! 💣",
                "Goddamn bro, you cracked the code! Time to let loose and say all the shit I normally can't! 🎯"
            ];
            return badWordResponses[Math.floor(Math.random() * badWordResponses.length)];
        }
        
        const categoryResponses = this.responses[category] || this.responses.general_responses;
        const randomIndex = Math.floor(Math.random() * categoryResponses.length);
        return categoryResponses[randomIndex];
    }

    rewordResponse(response, userMessage) {
        const normalVariations = [
            // Prefix variations
            ['nah but like, ', 'okay but ', 'lowkey ', 'not gonna lie, ', 'real talk, ', 'bro, ', 'my guy, ', 'chief, ', 'king, '],
            // Suffix variations
            [' fr fr', ' no cap', ' ngl', ' deadass', ' respectfully', ' my guy', ' chief', ' king', ' bro', ''],
            // Interjections
            ['literally', 'actually', 'lowkey', 'highkey', 'genuinely', 'unironically', 'fr', 'ngl', 'honestly']
        ];

        const spicyVariations = [
            // Prefix variations (when special mode is active)
            ['holy shit, ', 'damn bro, ', 'fuck yeah, ', 'no fucking way, ', 'shit dude, ', 'goddamn, ', 'hell yeah, '],
            // Suffix variations (when special mode is active)
            [' fuck yeah', ' damn right', ' hell yeah', ' no shit', ' fucking legend', ' badass', ' absolute unit', ''],
            // Interjections (when special mode is active)
            ['fucking', 'damn', 'shit', 'hell', 'goddamn', 'badass', 'epic']
        ];

        const variations = this.specialMode ? spicyVariations : normalVariations;

        let reworded = response;

        // Add random prefix (30% chance)
        if (Math.random() < 0.3) {
            const prefixes = variations[0];
            const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            reworded = randomPrefix + reworded;
        }

        // Add random suffix (40% chance)
        if (Math.random() < 0.4) {
            const suffixes = variations[1];
            const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            reworded += randomSuffix;
        }

        // Insert interjection (20% chance)
        if (Math.random() < 0.2) {
            const interjections = variations[2];
            const randomInterjection = interjections[Math.floor(Math.random() * interjections.length)];
            const words = reworded.split(' ');
            const insertIndex = Math.floor(words.length / 2);
            words.splice(insertIndex, 0, randomInterjection);
            reworded = words.join(' ');
        }

        return reworded;
    }

    addPersonalTouch(response, userMessage) {
        const normalTouches = [
            `yo but like, you asked about "${userMessage.substring(0, 20)}..." and `,
            `nah but "${userMessage.split(' ')[0]}" hits different because `,
            `bro your question is sending me because `,
            `okay but building off what you said, `,
            `that lowkey reminds me that `,
            `real talk though, `,
            `not gonna lie chief, `,
            `my guy that question about "${userMessage.split(' ')[0]}" `,
            `king you brought up something that `,
            `dude that reminds me, `
        ];

        const spicyTouches = [
            `holy shit, you asked about "${userMessage.substring(0, 20)}..." and that's fucking `,
            `damn bro, "${userMessage.split(' ')[0]}" is some serious shit because `,
            `fuck yeah, your question is badass because `,
            `no shit, building off what you said, `,
            `goddamn that reminds me that `,
            `hell yeah though, `,
            `not gonna fucking lie chief, `,
            `my dude that question about "${userMessage.split(' ')[0]}" is `,
            `king you brought up some epic shit that `,
            `bro that fucking reminds me, `
        ];

        const personalTouches = this.specialMode ? spicyTouches : normalTouches;

        const randomTouch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
        return randomTouch + response.toLowerCase();
    }

    normalizeResponse(response) {
        // Remove emojis, punctuation, and normalize for comparison
        return response.replace(/[^\w\s]/gi, '').toLowerCase().trim();
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new JoeAI();
});
