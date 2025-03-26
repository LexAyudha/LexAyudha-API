// Service for dyslexic lessons
const axios = require('axios');
const NodeCache = require("node-cache"); //Implementing caching for sentence generation
const cache = new NodeCache({ stdTTL: 18000 }); // TTL set to 5 hours in seconds

const fallbackLessonList = [
  {
    id: '01',
    name: 'Lesson_1',
    complexity: 3,
    points: 30,
    description: 'Three-word sentences that are easy to follow.',
    example: 'The dog barks.',
    chromaticTheme: 'chromTheme_1',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The cat sleeps.',
      'She runs fast.',
      'Birds fly high.',
      'He eats apples.',
      'The sun sets.',
      'Clouds move slowly.',
      'Fish swim deep.',
      'Wind blows strong.',
      'Flowers bloom beautifully.',
      'The dog jumps.',
     
    ]
  },
  {
    id: '02',
    name: 'Lesson_2',
    complexity: 4,
    points: 40,
    description: 'Four-word sentences for building fluency.',
    example: 'She quickly ran away.',
    chromaticTheme: 'chromTheme_2',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The boy runs fast.',
      'She drinks warm tea.',
      'Clouds cover the sky.',
      'They play outside happily.',
      'The baby smiles brightly.',
      'He reads a book.',
      'Waves crash on rocks.',
      'The sun rises early.',
      'Leaves fall in autumn.',
      'The dog barks loudly.',
     
    ]
  },
  {
    id: '03',
    name: 'Lesson_3',
    complexity: 5,
    points: 50,
    description: 'Introducing five-word sentence structures.',
    example: 'The flowers bloom in spring.',
    chromaticTheme: 'chromTheme_3',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The bird sings every morning.',
      'She walks to school daily.',
      'The baby laughs so loudly.',
      'Raindrops fall on the ground.',
      'The wind blows very strong.',
      'He quickly runs to work.',
      'The car moves very fast.',
      'They enjoy playing outside together.',
      'Leaves turn red in autumn.',
      'The sun sets behind mountains.',
      
    ]
  },
  {
    id: '04',
    name: 'Lesson_4',
    complexity: 6,
    points: 60,
    description: 'Challenging six-word sentence patterns.',
    example: 'He carefully placed the books neatly.',
    chromaticTheme: 'chromTheme_1',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'She happily danced in the rain.',
      'The birds chirped in the trees.',
      'He quickly ran towards the bus.',
      'A cat jumped onto the sofa.',
      'Leaves rustled in the autumn wind.',
      'The sun slowly disappeared behind clouds.',
      'She read a book before bed.',
      'The dog wagged its tail happily.',
      'Children played joyfully in the park.',
      'A train passed through the tunnel.',
      
    ]
  },
  {
    id: '05',
    name: 'Lesson_5',
    complexity: 7,
    points: 70,
    description: 'Seven-word sentences to enhance sentence structure.',
    example: 'The children laughed while playing outside.',
    chromaticTheme: 'chromTheme_2',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The sun rose early in the morning.',
      'She sang songs while cooking the meal.',
      'The dog barked loudly at the stranger.',
      'Rain poured heavily during the summer storm.',
      'He wore a jacket because it rained.',
      'The baby smiled while playing with toys.',
      'Leaves fluttered gently in the cold breeze.',
      'The train arrived late at the station.',
      'He found a coin under the bed.',
      'The teacher explained the lesson very clearly.',
      
    ]
  },
  {
    id: '06',
    name: 'Lesson_6',
    complexity: 8,
    points: 80,
    description: 'Eight-word sentences that expand expression and clarity.',
    example: 'The boy quickly ran through the tall grass.',
    chromaticTheme: 'chromTheme_3',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The wind howled loudly during the cold night.',
      'She painted a beautiful picture of the mountains.',
      'The cat chased the mouse under the table.',
      'Birds flew across the sky during the evening.',
      'He packed his bag and left for school.',
      'The dog followed the boy into the house.',
      'Raindrops tapped lightly on the window all night.',
      'They built a snowman together in the yard.',
      'The baby slept soundly through the noisy storm.',
      'The sun disappeared behind the tall grey buildings.',
      
    ]
  },
  {
    id: '07',
    name: 'Lesson_7',
    complexity: 9,
    points: 90,
    description: 'Nine-word sentences for practicing storytelling and pacing.',
    example: 'She walked quietly through the forest with her dog.',
    chromaticTheme: 'chromTheme_1',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The boy jumped over the puddle in the street.',
      'He opened the book and started reading out loud.',
      'The children gathered near the fire and told stories.',
      'She carried the basket filled with red juicy apples.',
      'They explored the cave with torches in their hands.',
      'He found a kitten hiding behind the wooden door.',
      'The stars twinkled brightly in the dark silent sky.',
      'A balloon floated away over the hills and trees.',
      'Grandma told us stories before we went to sleep.',
      'They watched the fireworks burst above the big lake.',
      
    ]
  },
  {
    id: '08',
    name: 'Lesson_8',
    complexity: 10,
    points: 100,
    description: 'Ten-word sentences for fluency, memory, and confidence in speaking.',
    example: 'The children ran around the playground laughing and having fun.',
    chromaticTheme: 'chromTheme_2',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'He looked out the window and saw a rainbow forming.',
      'The bird built a nest on top of the chimney.',
      'She opened the box and found a surprise inside.',
      'They sang songs together while walking through the field.',
      'A puppy barked at the squirrel running up the tree.',
      'The baby clapped hands when he saw his favorite toy.',
      'Mom prepared sandwiches for the picnic in the sunny park.',
      'The wind blew hard and scattered leaves everywhere around us.',
      'They danced around the campfire until it was midnight.',
      'He fixed his bike and rode around the neighborhood happily.',
      
    ]
  }
]

const fallbackQuizList = [
  {
    id: '01',
    name: 'Quiz_1',
    complexity: 3,
    points: 30,
    description: 'Three-word sentences that are easy to follow.',
    example: 'The dog barks.',
    chromaticTheme: 'chromTheme_1',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The cat sleeps.',
      'She runs fast.',
      'Birds fly high.',
      'He eats apples.',
      'The sun sets.',
      'Clouds move slowly.',
      'Fish swim deep.',
      'Wind blows strong.',
      'Flowers bloom beautifully.',
      'The dog jumps.',
      
    ]
  },
  {
    id: '02',
    name: 'Quiz_2',
    complexity: 4,
    points: 40,
    description: 'Four-word sentences for building fluency.',
    example: 'She quickly ran away.',
    chromaticTheme: 'chromTheme_2',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The boy runs fast.',
      'She drinks warm tea.',
      'Clouds cover the sky.',
      'They play outside happily.',
      'The baby smiles brightly.',
      'He reads a book.',
      'Waves crash on rocks.',
      'The sun rises early.',
      'Leaves fall in autumn.',
      'The dog barks loudly.',
      
    ]
  },
  {
    id: '03',
    name: 'Quiz_3',
    complexity: 5,
    points: 50,
    description: 'Introducing five-word sentence structures.',
    example: 'The flowers bloom in spring.',
    chromaticTheme: 'chromTheme_3',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The bird sings every morning.',
      'She walks to school daily.',
      'The baby laughs so loudly.',
      'Raindrops fall on the ground.',
      'The wind blows very strong.',
      'He quickly runs to work.',
      'The car moves very fast.',
      'They enjoy playing outside together.',
      'Leaves turn red in autumn.',
      'The sun sets behind mountains.',
      
    ]
  },
  {
    id: '04',
    name: 'Quiz_4',
    complexity: 6,
    points: 60,
    description: 'Challenging six-word sentence patterns.',
    example: 'He carefully placed the books neatly.',
    chromaticTheme: 'chromTheme_1',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'She happily danced in the rain.',
      'The birds chirped in the trees.',
      'He quickly ran towards the bus.',
      'A cat jumped onto the sofa.',
      'Leaves rustled in the autumn wind.',
      'The sun slowly disappeared behind clouds.',
      'She read a book before bed.',
      'The dog wagged its tail happily.',
      'Children played joyfully in the park.',
      'A train passed through the tunnel.',
      
    ]
  },
  {
    id: '05',
    name: 'Quiz_5',
    complexity: 7,
    points: 70,
    description: 'Seven-word sentences to enhance sentence structure.',
    example: 'The children laughed while playing outside.',
    chromaticTheme: 'chromTheme_2',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The sun rose early in the morning.',
      'She sang songs while cooking the meal.',
      'The dog barked loudly at the stranger.',
      'Rain poured heavily during the summer storm.',
      'He wore a jacket because it rained.',
      'The baby smiled while playing with toys.',
      'Leaves fluttered gently in the cold breeze.',
      'The train arrived late at the station.',
      'He found a coin under the bed.',
      'The teacher explained the lesson very clearly.',
      
    ]
  },
  {
    id: '06',
    name: 'Quiz_6',
    complexity: 8,
    points: 80,
    description: 'Eight-word sentences that expand expression and clarity.',
    example: 'The boy quickly ran through the tall grass.',
    chromaticTheme: 'chromTheme_3',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The wind howled loudly during the cold night.',
      'She painted a beautiful picture of the mountains.',
      'The cat chased the mouse under the table.',
      'Birds flew across the sky during the evening.',
      'He packed his bag and left for school.',
      'The dog followed the boy into the house.',
      'Raindrops tapped lightly on the window all night.',
      'They built a snowman together in the yard.',
      'The baby slept soundly through the noisy storm.',
      'The sun disappeared behind the tall grey buildings.',
      
    ]
  },
  {
    id: '07',
    name: 'Quiz_7',
    complexity: 9,
    points: 90,
    description: 'Nine-word sentences for practicing storytelling and pacing.',
    example: 'She walked quietly through the forest with her dog.',
    chromaticTheme: 'chromTheme_1',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'The boy jumped over the puddle in the street.',
      'He opened the book and started reading out loud.',
      'The children gathered near the fire and told stories.',
      'She carried the basket filled with red juicy apples.',
      'They explored the cave with torches in their hands.',
      'He found a kitten hiding behind the wooden door.',
      'The stars twinkled brightly in the dark silent sky.',
      'A balloon floated away over the hills and trees.',
      'Grandma told us stories before we went to sleep.',
      'They watched the fireworks burst above the big lake.',
      
    ]
  },
  {
    id: '08',
    name: 'Quiz_8',
    complexity: 10,
    points: 100,
    description: 'Ten-word sentences for fluency, memory, and confidence in speaking.',
    example: 'The children ran around the playground laughing and having fun.',
    chromaticTheme: 'chromTheme_2',
    colorTheme: 'chromThemeColor_1',
    chapters: [
      'He looked out the window and saw a rainbow forming.',
      'The bird built a nest on top of the chimney.',
      'She opened the box and found a surprise inside.',
      'They sang songs together while walking through the field.',
      'A puppy barked at the squirrel running up the tree.',
      'The baby clapped hands when he saw his favorite toy.',
      'Mom prepared sandwiches for the picnic in the sunny park.',
      'The wind blew hard and scattered leaves everywhere around us.',
      'They danced around the campfire until it was midnight.',
      'He fixed his bike and rode around the neighborhood happily.',
      
    ]
  }
]

exports.getGeneratedSentences = async (req, res) => {
    try {
        // Validate and sanitize input parameters
        const sentence_count = Math.min(Math.max(parseInt(req?.query?.sentence_count) || 10, 1), 20); // Min 1, Max 20
        const invalidateCache = req?.query?.refresh === 'true';
        let errorCount = 0;
        
        // Invalidates cache with logging
        if(invalidateCache){
            try {
                
                cache.del('lessonList');
                
            } catch (cacheError) {
                console.error('Cache invalidation failed:', cacheError);
                // Continue execution even if cache clear fails
            }
        }

        // Try to get cached lessons
        try {
            const cachedLessons = cache.get("lessonList");
            if(cachedLessons && Array.isArray(cachedLessons) && cachedLessons.length > 0){
                console.log('Serving from cache');
                return res.status(200).json(cachedLessons);
            }
        } catch (cacheError) {
            console.error('Cache retrieval failed:', cacheError);
            // Continue to generate new lessons if cache fails
        }
        
        // Construct lessonList - word length 3 to 10
        let lessonList = [];
        for (let i = 3; i <= 10; i++) {
            let lessonObject = {
                id: i - 2,
                name: `Lesson ${i - 2}`,
                description: `Introducing ${i} word sentence structures.`,
                example: '',
                complexity: i - 2,
                chromaticTheme: 'chromTheme_1',
                colorTheme: 'chromThemeColor_1',
                points: 10 * i,
                chapters: []
            }

            // Calling the sentence generation endpoint
            try {
                const response = await axios.get(
                    `http://localhost:8005/sentence/generate`,
                    {
                        params: {
                            word_length: i,
                            sentence_count: sentence_count
                        },
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        
                    }
                );
               
                if (response?.data?.success && Array.isArray(response?.data?.sentences)) {
                    lessonObject.example = response.data.sentences[0] || '';
                    lessonObject.chapters = response.data.sentences;
                    lessonList.push(lessonObject);
                } else {
                    console.warn(`Invalid response format for word length ${i}`);
                    errorCount++;
                }
            } catch (error) {
                console.error(`Error generating sentences for word length ${i}:`, error.message);
                errorCount++;
                
                // Don't immediately fail - continue with next iteration
                continue;
            }
        }

        console.log(`Generation completed with ${errorCount} errors`);
        
        // If no lessons were generated or too many errors, use fallback lessons
        if (errorCount > 3 || lessonList.length === 0) {
            console.log('Using fallback lesson list due to errors');
            lessonList = fallbackLessonList;
        }

        // Try to cache the results
        try {
            if (lessonList.length > 0) {
                cache.set("lessonList", lessonList);
                console.log('New lessons cached successfully');
            }
        } catch (cacheError) {
            console.error('Failed to cache lessons:', cacheError);
            // Continue even if caching fails
        }

        return res.status(200).json(lessonList);

    } catch (error) {
        console.error('Critical error in getGeneratedSentences:', error);
        
        // Try to serve fallback content even in case of critical error
        try {
            return res.status(200).json(fallbackLessonList);
        } catch (fallbackError) {
            return res.status(500).json({ 
                error: 'Internal server error',
                message: 'Failed to generate or serve lesson content'
            });
        }
    }
};


exports.generateQuizeSentences = async (req, res) => {
    try {
        // Validate and sanitize input parameters
        const sentence_count = Math.min(Math.max(parseInt(req?.query?.sentence_count) || 10, 1), 20); // Min 1, Max 20
        const baseQuizCount = Math.min(Math.max(parseInt(req?.query?.quiz_count) || 8, 3), 8); // Max 8 to allow for +2
        const quizCount = baseQuizCount + 2; 
        
        let errorCount = 0;
        
        // Construct lessonList - word length 3 to 10
        let lessonList = [];
        for (let i = 3; i <= quizCount; i++) {
            let lessonObject = {
                id: i - 2,
                name: `Quiz ${i - 2}`,
                description: `Introducing ${i} word sentence structures.`,
                example: '',
                complexity: i,
                chromaticTheme: 'chromTheme_1',
                colorTheme: 'chromThemeColor_1',
                points: 10 * i,
                chapters: []
            }

            try {
                const response = await axios.get(
                    `http://localhost:8005/sentence/generate`,
                    {
                        params: {
                            word_length: i,
                            sentence_count: sentence_count
                        },
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        
                    }
                );
               
                if (response?.data?.success && Array.isArray(response?.data?.sentences)) {
                    lessonObject.example = response.data.sentences[0] || '';
                    lessonObject.chapters = response.data.sentences;
                    lessonList.push(lessonObject);
                } else {
                    console.warn(`Invalid response format for word length ${i}`);
                    errorCount++;
                }
            } catch (error) {
                console.error(`Error generating sentences for word length ${i}:`, error.message);
                errorCount++;
                
                // Don't immediately fail - continue with next iteration
                continue;
            }
        }

        console.log(`Generation completed with ${errorCount} errors`);
        
        // If no lessons were generated or too many errors, use fallback
        if (errorCount > 3 || lessonList.length === 0) {
            console.log('Using fallback lesson list due to errors');
            lessonList = fallbackQuizList;
        }


        return res.status(200).json(lessonList);

    } catch (error) {
        console.error('Critical error in getGeneratedSentences:', error);
        
        // Try to serve fallback content even in case of critical error
        try {
            return res.status(200).json(fallbackQuizList);
        } catch (fallbackError) {
            return res.status(500).json({ 
                error: 'Internal server error',
                message: 'Failed to generate or serve lesson content'
            });
        }
    }
};