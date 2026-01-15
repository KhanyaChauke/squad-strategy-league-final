
(async () => {
    try {
        console.log("Fetching: https://betafpsl.netlify.app/.netlify/functions/news");
        const res = await fetch("https://betafpsl.netlify.app/.netlify/functions/news");
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
})();
