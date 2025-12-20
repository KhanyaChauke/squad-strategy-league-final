
const API_KEY = "1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749";
const BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";

async function getLeagues() {
    const url = `${BASE_URL}/leagues?country=South-Africa`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(error);
    }
}

getLeagues();
