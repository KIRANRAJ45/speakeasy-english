import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 SpeakEasy English Server has started successfully!`);
  console.log(`📡 Local server listening on http://localhost:${PORT}`);
  console.log(`=================================================`);
});
