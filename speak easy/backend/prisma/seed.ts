import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Badges
  const badges = [
    { title: 'Welcome aboard', description: 'Signed up for SpeakEasy English', badgeIcon: 'user-plus', xpThreshold: 0 },
    { title: 'Starter Streak', description: 'Completed a 3-day learning streak', badgeIcon: 'zap', xpThreshold: 50 },
    { title: 'Word Wizard', description: 'Learned 20 new vocabulary words', badgeIcon: 'book-open', xpThreshold: 100 },
    { title: 'Grammar Master', description: 'Completed all basic grammar lessons', badgeIcon: 'award', xpThreshold: 200 },
    { title: 'Speech Champion', description: 'Talked to the AI coach for 30 minutes', badgeIcon: 'mic', xpThreshold: 500 },
    { title: 'Elite Speaker', description: 'Earned over 1000 total XP', badgeIcon: 'shield', xpThreshold: 1000 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { title: badge.title },
      update: badge,
      create: badge,
    });
  }
  console.log('Badges seeded.');

  // 2. Create Grammar Lessons
  const lessons = [
    {
      title: 'Introduction to Tenses',
      titleTamil: 'காலங்கள் - ஓர் அறிமுகம்',
      category: 'Grammar',
      difficulty: 'Beginner',
      content: 'Tenses express the time of an action. There are three main tenses: Present, Past, and Future. Each is divided into Simple, Continuous, Perfect, and Perfect Continuous. For example: "I speak English" (Simple Present), "I spoke English" (Simple Past), "I will speak English" (Simple Future).',
      contentTamil: 'செயல் நடைபெறும் நேரத்தை காலங்கள் (Tenses) குறிக்கின்றன. இதில் மூன்று முக்கிய வகைகள் உள்ளன: நிகழ்காலம் (Present), கடந்தகாலம் (Past), மற்றும் எதிர்காலம் (Future). ஒவ்வொன்றும் எளிய, தொடர், முற்றுப்பெற்ற மற்றும் முற்றுப்பெற்ற தொடர் என்று வகைப்படுத்தப்படுகின்றன. உதாரணம்: "I speak English" (நான் ஆங்கிலம் பேசுகிறேன் - எளிய நிகழ்காலம்), "I spoke English" (நான் ஆங்கிலம் பேசினேன் - எளிய கடந்தகாலம்).',
      xpReward: 20
    },
    {
      title: 'Definite and Indefinite Articles (A, An, The)',
      titleTamil: 'ஆர்ட்டிகல்ஸ் (Articles - A, An, The)',
      category: 'Grammar',
      difficulty: 'Beginner',
      content: 'Articles define a noun as specific or unspecific. "A" and "An" are indefinite articles used before singular countable nouns. "An" is used before vowel sounds (a, e, i, o, u). Example: "a book", "an apple". "The" is the definite article used for specific objects. Example: "the sun", "the book on the table".',
      contentTamil: 'பெயர்ச்சொற்களை (Nouns) குறிப்பிட்டதாகவோ அல்லது பொதுவானதாகவோ காட்ட ஆர்ட்டிகல்ஸ் உதவுகின்றன. "A" மற்றும் "An" ஆகியவை பொதுவான பெயர்ச்சொல்லுக்கு முன் வரும். "An" என்பது உயிரெழுத்து ஒலிக்கு (Vowel Sound) முன்னால் பயன்படுத்தப்படும். உதாரணம்: "a book" (ஒரு புத்தகம்), "an apple" (ஒரு ஆப்பிள்). "The" என்பது குறிப்பிட்ட ஒன்றைச் சொல்லும்போது பயன்படும். உதாரணம்: "the sun" (சூரியன்).',
      xpReward: 20
    },
    {
      title: 'Prepositions of Place (In, On, At)',
      titleTamil: 'இடத்தைக் குறிக்கும் இடைச்சொற்கள் (In, On, At)',
      category: 'Grammar',
      difficulty: 'Intermediate',
      content: 'Prepositions show relationship between nouns. "In" is used for enclosed spaces or areas (in the room, in London). "On" is used for surfaces (on the table, on the wall). "At" is used for specific points or locations (at the bus stop, at the entrance).',
      contentTamil: 'பெயர்ச்சொற்களுக்கு இடையே உள்ள தொடர்பை இடைச்சொற்கள் (Prepositions) காட்டுகின்றன. "In" என்பது மூடிய அல்லது பெரிய பரப்பைக் குறிக்கும் (அறைக்குள், லண்டனில்). "On" என்பது ஒரு மேற்பரப்பின் மேல் இருப்பதைக் குறிக்கும் (மேஜை மீது). "At" என்பது ஒரு குறிப்பிட்ட இடத்தை அல்லது புள்ளியைக் குறிக்கும் (பேருந்து நிறுத்தத்தில்).',
      xpReward: 30
    },
    {
      title: 'Common Mistakes in Sentence Formation',
      titleTamil: 'வாக்கியங்கள் அமைப்பதில் ஏற்படும் பொதுவான தவறுகள்',
      category: 'Grammar',
      difficulty: 'Intermediate',
      content: 'Many learners confuse subject-verb agreement. For example, saying "He play cricket" instead of the correct "He plays cricket". When the subject is third-person singular (He, She, It), you must add -s or -es to the base verb in simple present tense.',
      contentTamil: 'பல கற்பவர்கள் சப்ஜெக்ட்-வெர்ப் (Subject-Verb) அமைப்பில் தவறு செய்கிறார்கள். உதாரணமாக, "He play cricket" என்பது தவறு; "He plays cricket" என்பதே சரி. எழுவாய் (Subject) படர்க்கை ஒருமையாக (He, She, It) இருக்கும்போது, நிகழ்கால வினைச்சொல்லுடன் -s அல்லது -es சேர்க்க வேண்டும்.',
      xpReward: 30
    }
  ];

  for (const lesson of lessons) {
    await prisma.lesson.create({
      data: lesson
    });
  }
  console.log('Lessons seeded.');

  // 3. Create Vocabulary words (20 words)
  const vocabList = [
    {
      word: 'Accomplish',
      wordTamil: 'சாதி / நிறைவேற்று',
      partOfSpeech: 'Verb',
      pronunciation: 'அக்காம்ப்ளிஷ்',
      definition: 'To achieve or complete something successfully.',
      definitionTamil: 'ஒரு காரியத்தை வெற்றிகரமாக முடிப்பது அல்லது சாதிப்பது.',
      exampleSentence: 'With hard work, you can accomplish your goals.',
      exampleSentenceTamil: 'கடின உழைப்பால் உங்கள் இலக்குகளை நீங்கள் சாதிக்க முடியும்.',
      synonyms: 'Achieve, attain, execute',
      antonyms: 'Fail, neglect, lose'
    },
    {
      word: 'Bizarre',
      wordTamil: 'விசித்திரமான / விநோதமான',
      partOfSpeech: 'Adjective',
      pronunciation: 'பிஸார்',
      definition: 'Very strange or unusual, especially so as to cause interest or amusement.',
      definitionTamil: 'மிகவும் விசித்திரமான அல்லது வழக்கத்திற்கு மாறான ஒன்று.',
      exampleSentence: 'The party had a bizarre theme with glowing decorations.',
      exampleSentenceTamil: 'அந்த விழாவில் ஒளிரும் அலங்காரங்களுடன் ஒரு விசித்திரமான தீம் இருந்தது.',
      synonyms: 'Strange, weird, peculiar',
      antonyms: 'Normal, ordinary, common'
    },
    {
      word: 'Collaborate',
      wordTamil: 'ஒன்றிணைந்து செயல்படு',
      partOfSpeech: 'Verb',
      pronunciation: 'கொலாபரேட்',
      definition: 'Work jointly on an activity, especially to produce or create something.',
      definitionTamil: 'ஒரு புதிய படைப்பை உருவாக்க அல்லது திட்டத்தை முடிக்க கூட்டாக இணைந்து செயல்படுவது.',
      exampleSentence: 'Different departments must collaborate to complete the project.',
      exampleSentenceTamil: 'திட்டத்தை முடிக்க பல்வேறு துறைகள் ஒன்றிணைந்து செயல்பட வேண்டும்.',
      synonyms: 'Cooperate, team up, unite',
      antonyms: 'Oppose, disagree, separate'
    },
    {
      word: 'Diligent',
      wordTamil: 'சுறுசுறுப்பான / விடாமுயற்சியுள்ள',
      partOfSpeech: 'Adjective',
      pronunciation: 'டிலிஜென்ட்',
      definition: 'Having or showing care and conscientiousness in one\'s work or duties.',
      definitionTamil: 'தன் வேலையில் மிகுந்த அக்கறையும் விடாமுயற்சியும் காட்டுவது.',
      exampleSentence: 'She is a diligent student who always finishes her homework on time.',
      exampleSentenceTamil: 'அவள் எப்போதுமே வீட்டுப்பாடங்களைச் சரியான நேரத்தில் முடிக்கும் சுறுசுறுப்பான மாணவி.',
      synonyms: 'Industrious, hard-working, assiduous',
      antonyms: 'Lazy, careless, idle'
    },
    {
      word: 'Eloquent',
      wordTamil: 'சொல்லாற்றல் மிக்க / சரளமான',
      partOfSpeech: 'Adjective',
      pronunciation: 'எலோகண்ட்',
      definition: 'Fluent or persuasive in speaking or writing.',
      definitionTamil: 'பேச்சிலோ அல்லது எழுத்துத் திறனிலோ மற்றவர்களைக் கவரும் வகையில் சரளமாக இருப்பது.',
      exampleSentence: 'His eloquent speech moved the entire audience to tears.',
      exampleSentenceTamil: 'அவருடைய சொல்லாற்றல் மிக்க பேச்சு கூடியிருந்த அனைவரையும் கண்ணீர் சிந்த வைத்தது.',
      synonyms: 'Fluent, articulate, expressive',
      antonyms: 'Inarticulate, silent, hesitant'
    },
    {
      word: 'Frequent',
      wordTamil: 'அடிக்கடி நிகழ்கிற',
      partOfSpeech: 'Adjective',
      pronunciation: 'ப்ரீக்வென்ட்',
      definition: 'Occurring or done on many occasions with short intervals in between.',
      definitionTamil: 'குறுகிய கால இடைவெளியில் மீண்டும் மீண்டும் நடக்கும் நிகழ்வு.',
      exampleSentence: 'He makes frequent visits to his hometown to see his parents.',
      exampleSentenceTamil: 'பெற்றோரைப் பார்ப்பதற்காக அவர் அடிக்கடி சொந்த ஊருக்குச் செல்கிறார்.',
      synonyms: 'Repeated, common, regular',
      antonyms: 'Rare, occasional, infrequent'
    },
    {
      word: 'Genuine',
      wordTamil: 'உண்மையான / அசலான',
      partOfSpeech: 'Adjective',
      pronunciation: 'ஜென்யூன்',
      definition: 'Truly what something is said to be; authentic.',
      definitionTamil: 'போலியானது அல்லாத, உண்மையான அல்லது நம்பகமான ஒன்று.',
      exampleSentence: 'I can see a genuine desire in you to learn English.',
      exampleSentenceTamil: 'உங்களில் ஆங்கிலம் கற்க வேண்டும் என்ற உண்மையான ஆசையை என்னால் பார்க்க முடிகிறது.',
      synonyms: 'Authentic, real, honest',
      antonyms: 'Fake, false, artificial'
    },
    {
      word: 'Hesitate',
      wordTamil: 'தயங்கு / யோசி',
      partOfSpeech: 'Verb',
      pronunciation: 'ஹெசிடேட்',
      definition: 'Pause before saying or doing something, especially through uncertainty.',
      definitionTamil: 'சந்தேகம் அல்லது பயத்தால் எதையாவது செய்யவோ சொல்லவோ தயங்குவது.',
      exampleSentence: 'Do not hesitate to ask questions if you do not understand.',
      exampleSentenceTamil: 'உங்களுக்குப் புரியவில்லை என்றால் கேள்வி கேட்கத் தயங்காதீர்கள்.',
      synonyms: 'Pause, waver, delay',
      antonyms: 'Decide, proceed, continue'
    },
    {
      word: 'Inspire',
      wordTamil: 'ஊக்கப்படுத்து / உத்வேகம் அளி',
      partOfSpeech: 'Verb',
      pronunciation: 'இன்ஸ்பயர்',
      definition: 'Fill someone with the urge or ability to do or feel something, especially something creative.',
      definitionTamil: 'மற்றவர்களுக்கு ஏதாவது சாதிக்க வேண்டும் என்ற உத்வேகத்தையோ ஊக்கத்தையோ தருவது.',
      exampleSentence: 'My English teacher inspired me to read more books.',
      exampleSentenceTamil: 'அதிக புத்தகங்களைப் படிக்க என் ஆங்கில ஆசிரியர் எனக்கு உத்வேகம் அளித்தார்.',
      synonyms: 'Motivate, encourage, stimulate',
      antonyms: 'Discourage, depress, deter'
    },
    {
      word: 'Jealous',
      wordTamil: 'பொறாமை கொண்ட',
      partOfSpeech: 'Adjective',
      pronunciation: 'ஜெலஸ்',
      definition: 'Feeling or showing resentment of someone and their achievements or advantages.',
      definitionTamil: 'மற்றவர்களின் வளர்ச்சி அல்லது சிறப்பைக் கண்டு வருந்துதல்/பொறாமைப்படுதல்.',
      exampleSentence: 'They were jealous of his rapid career growth.',
      exampleSentenceTamil: 'அவரது விரைவான தொழில் வளர்ச்சியைப் பார்த்து அவர்கள் பொறாமைப்பட்டனர்.',
      synonyms: 'Envious, resentful, covetous',
      antonyms: 'Content, proud, happy'
    },
    {
      word: 'Knowledgeable',
      wordTamil: 'அறிவுள்ள / விவரமறிந்த',
      partOfSpeech: 'Adjective',
      pronunciation: 'நாலேஜ்ஜபிள்',
      definition: 'Intelligent and well informed.',
      definitionTamil: 'விஷயங்களை நன்கு அறிந்து தெளிவுடன் இருப்பது.',
      exampleSentence: 'Our tour guide was extremely knowledgeable about history.',
      exampleSentenceTamil: 'எங்கள் சுற்றுலா வழிகாட்டி வரலாற்றைப் பற்றி மிகவும் விவரமறிந்தவராக இருந்தார்.',
      synonyms: 'Informed, educated, wise',
      antonyms: 'Ignorant, uneducated, foolish'
    },
    {
      word: 'Linger',
      wordTamil: 'மறையாமல் நீடித்திரு / தங்கியிரு',
      partOfSpeech: 'Verb',
      pronunciation: 'லிங்கர்',
      definition: 'Stay in a place longer than necessary, typically because of a reluctance to leave.',
      definitionTamil: 'போக மனமில்லாமல் ஒரு இடத்திலேயே நீண்ட நேரம் தங்கியிருப்பது.',
      exampleSentence: 'The sweet taste of the traditional dessert lingered in my mouth.',
      exampleSentenceTamil: 'அந்த பாரம்பரிய இனிப்பின் சுவை என் வாயில் நீண்ட நேரம் நீடித்திருந்தது.',
      synonyms: 'Loiter, remain, stay',
      antonyms: 'Leave, vanish, rush'
    },
    {
      word: 'Miserable',
      wordTamil: 'பரிதாபகரமான / துயரமான',
      partOfSpeech: 'Adjective',
      pronunciation: 'மிசரபிள்',
      definition: 'Wretchedly unhappy or uncomfortable.',
      definitionTamil: 'மிகுந்த வருத்தத்திலோ அல்லது கவலையிலோ வாழும் ஒரு நிலை.',
      exampleSentence: 'The rainy weather made everyone feel a bit miserable.',
      exampleSentenceTamil: 'மழைக்காலம் அனைவரையும் சற்றே சோகமாக உணரச் செய்தது.',
      synonyms: 'Sad, unhappy, gloomy',
      antonyms: 'Happy, joyful, cheerful'
    },
    {
      word: 'Navigate',
      wordTamil: 'வழிநடத்து / திசையறிந்து செல்',
      partOfSpeech: 'Verb',
      pronunciation: 'நேவிகேட்',
      definition: 'Plan and direct the route or course of a ship, aircraft, or other form of transport.',
      definitionTamil: 'பாதையைத் தேர்ந்தெடுத்துச் செல்வது அல்லது வழிகாட்டுவது.',
      exampleSentence: 'We used a GPS system to navigate through the forest road.',
      exampleSentenceTamil: 'காட்டுச் சாலையில் வழிசெல்ல நாங்கள் ஜி.பி.எஸ் அமைப்பைப் பயன்படுத்தினோம்.',
      synonyms: 'Steer, guide, direct',
      antonyms: 'Get lost, wander, drift'
    },
    {
      word: 'Obvious',
      wordTamil: 'வெளிப்படையான / தெளிவான',
      partOfSpeech: 'Adjective',
      pronunciation: 'ஆப்வியஸ்',
      definition: 'Easily perceived or understood; clear, self-evident, or apparent.',
      definitionTamil: 'எளிதாகப் புரிந்துகொள்ளக்கூடிய அல்லது கண்ணுக்குத் தெளிவாகத் தெரியும் ஒன்று.',
      exampleSentence: 'The solution to this simple puzzle is quite obvious.',
      exampleSentenceTamil: 'இந்த எளிய புதிரின் தீர்வு மிகவும் வெளிப்படையானது.',
      synonyms: 'Clear, evident, apparent',
      antonyms: 'Hidden, obscure, unclear'
    },
    {
      word: 'Plausible',
      wordTamil: 'ஏற்கத்தக்க / சாத்தியமான',
      partOfSpeech: 'Adjective',
      pronunciation: 'ப்ளாஸிபிள்',
      definition: 'Of an argument or statement, seeming reasonable or probable.',
      definitionTamil: 'நம்பத்தகுந்ததாகவோ அல்லது சாத்தியமுள்ளதாகவோ தோன்றும் விளக்கம்.',
      exampleSentence: 'He gave a plausible excuse for his delay, so the teacher accepted it.',
      exampleSentenceTamil: 'அவர் தாமதத்திற்கு ஒரு ஏற்றுக்கொள்ளக்கூடிய காரணத்தைக் கூறினார், எனவே ஆசிரியர் அதை ஏற்றுக்கொண்டார்.',
      synonyms: 'Credible, believable, reasonable',
      antonyms: 'Implausible, unlikely, impossible'
    },
    {
      word: 'Queue',
      wordTamil: 'வரிசை / கியூ',
      partOfSpeech: 'Noun',
      pronunciation: 'கியூ',
      definition: 'A line or sequence of people or vehicles awaiting their turn to be attended to or to proceed.',
      definitionTamil: 'தங்கள் முறைக்காக மக்கள் அல்லது வாகனங்கள் வரிசையாக நிற்பது.',
      exampleSentence: 'There was a long queue at the ticket counter.',
      exampleSentenceTamil: 'டிக்கெட் கவுண்டரில் நீண்ட வரிசை இருந்தது.',
      synonyms: 'Line, row, file',
      antonyms: 'Disorder, crowd'
    },
    {
      word: 'Reluctant',
      wordTamil: 'விருப்பமில்லாத / தயங்குகிற',
      partOfSpeech: 'Adjective',
      pronunciation: 'ரிலக்டன்ட்',
      definition: 'Unwilling and hesitant; disinclined.',
      definitionTamil: 'ஒன்றைச் செய்ய மனமில்லாமல் தயங்குவது.',
      exampleSentence: 'Many employees were reluctant to work on weekends.',
      exampleSentenceTamil: 'பல ஊழியர்கள் வார இறுதி நாட்களில் வேலை செய்ய விருப்பமில்லாமல் இருந்தனர்.',
      synonyms: 'Unwilling, hesitant, loath',
      antonyms: 'Eager, willing, enthusiastic'
    },
    {
      word: 'Sufficient',
      wordTamil: 'போதுமான / திருப்திகரமான',
      partOfSpeech: 'Adjective',
      pronunciation: 'சஃபிஷியன்ட்',
      definition: 'Enough; adequate.',
      definitionTamil: 'தேவைக்கு ஏற்ப தாராளமாக அல்லது போதுமானதாக இருப்பது.',
      exampleSentence: 'We have sufficient food supplies for the entire camping trip.',
      exampleSentenceTamil: 'முகாம் பயணம் முழுவதற்கும் தேவையான போதுமான உணவுப் பொருட்கள் எங்களிடம் உள்ளன.',
      synonyms: 'Enough, adequate, ample',
      antonyms: 'Insufficient, deficient, lacking'
    },
    {
      word: 'Trivial',
      wordTamil: 'அற்பமான / முக்கியத்துவமற்ற',
      partOfSpeech: 'Adjective',
      pronunciation: 'ட்ரிவியல்',
      definition: 'Of little value or importance.',
      definitionTamil: 'மிகவும் சாதாரண, பெரிய அளவில் முக்கியமில்லாத ஒரு விஷயம்.',
      exampleSentence: 'Do not waste your time arguing over trivial issues.',
      exampleSentenceTamil: 'முக்கியத்துவமற்ற அற்பமான பிரச்சினைகளுக்காக உங்கள் நேரத்தை விவாதித்து வீணாக்காதீர்கள்.',
      synonyms: 'Unimportant, minor, insignificant',
      antonyms: 'Important, crucial, significant'
    }
  ];

  for (const vocab of vocabList) {
    await prisma.vocabulary.upsert({
      where: { word: vocab.word },
      update: vocab,
      create: vocab,
    });
  }
  console.log('Vocabulary seeded.');

  // Create a default Admin and User for testing
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@speakeasy.com' },
    update: {},
    create: {
      email: 'admin@speakeasy.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          name: 'SpeakEasy Admin',
          level: 'Advanced',
        }
      }
    }
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@speakeasy.com' },
    update: {},
    create: {
      email: 'demo@speakeasy.com',
      passwordHash: userPassword,
      role: 'USER',
      profile: {
        create: {
          name: 'Demo Student',
          level: 'Beginner',
          xp: 15,
          streak: 1,
          lastActive: new Date()
        }
      }
    }
  });

  console.log('Users seeded successfully. Admin: admin@speakeasy.com / admin123, User: demo@speakeasy.com / user123');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
