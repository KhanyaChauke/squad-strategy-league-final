
import { fetchPSLNews } from './src/services/newsService';
import dotenv from 'dotenv';
dotenv.config();

async function testNews() {
    try {
        const apiKey = process.env.VITE_RAPID_API_KEY || '';
        console.log('Using API Key:', apiKey ? 'FOUND' : 'MISSING');
        const news = await fetchPSLNews(apiKey);
        console.log('Fetched News Count:', news.length);
        if (news.length > 0) {
            console.log('First News Item:', JSON.stringify(news[0], null, 2));
        }
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

testNews();
