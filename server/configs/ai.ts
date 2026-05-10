import axios from 'axios';

const ai = axios.create({
    baseURL: 'https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com',
    headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'ai-text-to-image-generator-flux-free-api.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY as string
    }
});

export default ai;