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
            const magnetLink = row.querySelector('a[href^="magnet:"]')?.getAttribute('href') || "";
            const id = titleElement?.getAttribute('href')?.split('/').pop() || "";
            const seeders = row.querySelector('td:nth-last-child(3)')?.textContent?.trim() || "0";

            results.push({
                id: id,
                title: titleElement ? (titleElement.title || titleElement.textContent.trim()) : "Unknown",
                url: magnetLink,
                subtitle: `Seeders: ${seeders}`,
                image: 'https://nyaa.si/static/favicon.png' 
            });
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
            title: title,
            description: "",
            episodes: [
                {
                    title: title,
                    urls: [{ name: "Magnet", url: magnet }]
                }
            ]
        };
    } catch (e) {
        return { title: "", description: "", episodes: [] };
    }
}
