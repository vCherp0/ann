const BASE_URL = 'https://nyaa.si';

export async function search(query, page = 1) {
    try {
        const url = `${BASE_URL}/?f=0&c=1_2&q=${encodeURIComponent(query)}&p=${page}`;
        const response = await fetch(url);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const rows = doc.querySelectorAll('table.torrent-list tbody tr');
        
        const results = [];

        for (const row of rows) {
            const links = row.querySelectorAll('td[colspan="2"] a:not(.comments)');
            const titleElement = links[links.length - 1];
            
            const name = titleElement ? (titleElement.title || titleElement.textContent.trim()) : "";
            const link = row.querySelector('a[href^="magnet:"]')?.getAttribute('href') || "";
            const id = titleElement?.getAttribute('href')?.split('/').pop() || "";
            
            const size = row.querySelector('td:nth-last-child(4)')?.textContent?.trim() || "0 MB";
            const date = row.querySelector('td:nth-last-child(5)')?.textContent?.trim() || "";
            const seeds = row.querySelector('td:nth-last-child(3)')?.textContent?.trim() || "0";
            const peers = row.querySelector('td:nth-last-child(2)')?.textContent?.trim() || "0";

            if (name && link) {
                results.push({
                    id: id,
                    name: name,
                    link: link,
                    seeds: parseInt(seeds) || 0,
                    peers: parseInt(peers) || 0,
                    size: size,
                    date: date,
                    image: 'https://nyaa.si/static/favicon.png'
                });
            }
        }

        return results;
    } catch (e) {
        return [];
    }
}

export async function getDetails(id) {
    try {
        const url = `${BASE_URL}/view/${id}`;
        const response = await fetch(url);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const title = doc.querySelector('h3.panel-title')?.textContent.trim() || "Unknown";
        const magnet = doc.querySelector('a[href^="magnet:"]')?.getAttribute('href') || "";

        return {
            name: title,
            description: "",
            episodes: [
                {
                    name: "Torrent",
                    urls: [{ name: "Magnet Link", url: magnet }]
                }
            ]
        };
    } catch (e) {
        return { 
            name: "", 
            description: "", 
            episodes: [] 
        };
    }
}
