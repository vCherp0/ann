const BASE_URL = 'https://nyaa.si';

export async function search(query, page = 1) {
    const url = `${BASE_URL}/?f=0&c=1_2&q=${encodeURIComponent(query)}&p=${page}`;
    
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows = doc.querySelectorAll('table.torrent-list tbody tr');
    
    const results = Array.from(rows).map(row => {
        const links = row.querySelectorAll('td[colspan="2"] a:not(.comments)');
        const titleElement = links[links.length - 1];
        const magnetLink = row.querySelector('a[href^="magnet:"]')?.getAttribute('href');
        const id = titleElement.getAttribute('href').split('/').pop();
        const seeders = row.querySelector('td:nth-last-child(3)').textContent;

        return {
            id: id,
            title: titleElement.title || titleElement.textContent.trim(),
            url: magnetLink, 
            subtitle: `Seeders: ${seeders}`,
            image: 'https://nyaa.si/static/favicon.png' 
        };
    });

    return {
        results: results,
        hasMore: doc.querySelector('ul.pagination li.next:not(.disabled)') !== null
    };
}

export async function getDetails(id) {
    const url = `${BASE_URL}/view/${id}`;
    const response = await fetch(url);
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const title = doc.querySelector('h3.panel-title')?.textContent.trim();
    const description = doc.querySelector('#torrent-description')?.textContent.trim();
    const magnet = doc.querySelector('.panel-footer a.card-footer-item, .panel-footer a[href^="magnet:"]')?.getAttribute('href');

    return {
        title: title,
        description: description,
        episodes: [
            {
                title: title,
                urls: [{ name: "Magnet Link", url: magnet }]
            }
        ]
    };
}