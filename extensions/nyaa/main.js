const BASE_URL = 'https://nyaa.si';

const test = (url) => {
    return /nyaa\.si/.test(url);
};

const batch = async (query, page = 1) => {
    try {
        const url = `${BASE_URL}/?f=0&c=1_2&q=${encodeURIComponent(query)}&p=${page}`;
        const response = await fetch(url);
        const html = await response.text();

        const results = [];
        const rows = html.split('<tr class="'); 
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row.includes('magnet:?xt=')) continue;

            const titleMatch = row.match(/title="([^"]+)"/);
            const name = titleMatch ? titleMatch[1] : "Unknown";

            const magnetMatch = row.match(/href="(magnet:\?xt=[^"]+)"/);
            const link = magnetMatch ? magnetMatch[1] : "";

            const idMatch = row.match(/\/view\/(\d+)/);
            const id = idMatch ? idMatch[1] : "";

            const tdRegex = /<td[^>]*>(.*?)<\/td>/g;
            let tds = [];
            let match;
            while ((match = tdRegex.exec(row)) !== null) {
                tds.push(match[1].replace(/<[^>]+>/g, '').trim());
            }

            if (name && link) {
                results.push({
                    id: id,
                    name: name,
                    link: link,
                    size: tds[3] || "Unknown",
                    date: tds[4] || "",
                    seeds: parseInt(tds[5]) || 0,
                    peers: parseInt(tds[6]) || 0,
                    image: 'https://nyaa.si/static/favicon.png'
                });
            }
        }
        return results; 
    } catch (e) {
        return [];
    }
};

const single = async (id) => {
    try {
        const url = `${BASE_URL}/view/${id}`;
        const response = await fetch(url);
        const html = await response.text();
        
        const titleMatch = html.match(/<h3 class="panel-title">([^<]+)<\/h3>/);
        const name = titleMatch ? titleMatch[1].trim() : "Unknown";

        const magnetMatch = html.match(/href="(magnet:\?xt=[^"]+)"/);
        const link = magnetMatch ? magnetMatch[1] : "";

        return {
            name: name,
            description: "Scraped from Nyaa.si",
            episodes: [
                {
                    name: "Torrent",
                    urls: [{ name: "Magnet Link", url: link }] 
                }
            ]
        };
    } catch (e) {
        return { name: "", description: "", episodes: [] };
    }
};

export { test, batch, single };
