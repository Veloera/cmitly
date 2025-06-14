import axios from 'axios';

export async function generateCommit(diff, { baseUrl, apiKey, model }, systemPrompt, logger) {
  try {
    const response = await axios.post(`${baseUrl}/chat/completions`, {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: diff }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const message = response.data.choices?.[0]?.message?.content.trim();
    if (!message) {
      logger.error('Failed to generate commit message');
      process.exit(5);
    }
    return message;
  } catch (error) {
    logger.error('Failed to generate commit message:', error);
    process.exit(5);
  }
}