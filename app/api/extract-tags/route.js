import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');
    if (!videoId) {
      return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
    }
    
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    
    // Initialize the OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Call the API using the client
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text", 
              text: "List any visible food ingredients shown in this image. Be specific but concise. Common ingredients are: Beef, Chicken, Fish, Rice, etc.. Skip brands and just give ingredient names. ALWAYS return list in the format: [Item1, Item2, Item3] without including the brackets, where each ingredient is capitalized and separated by comma"
            },
            {
              type: "image_url",
              image_url: {
                url: thumbnailUrl
              }
            }
          ]
        }
      ],
      max_tokens: 100
    });
    
    // Extract content from the response
    const content = response.choices[0]?.message?.content || '';
    console.log('Content:', content);
    
    // Process the content into tags
    const tags = content
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
    
    return NextResponse.json({ tags }, { status: 200 });
  } catch (err) {
    console.error('extract-tags error:', err);
    return NextResponse.json({ error: 'Failed to extract tags' }, { status: 500 });
  }
}