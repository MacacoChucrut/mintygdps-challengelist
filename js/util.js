// Función robusta para extraer ID de YouTube
export function getYoutubeIdFromUrl(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Generar el iframe correcto según la URL
export function embed(url) {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const id = getYoutubeIdFromUrl(url);
        if (id) {
            return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`;
        }
    } else if (url.includes("medal.tv")) {
        const match = url.match(/medal\.tv\/(?:clip|games\/\w+\/clips)\/([a-zA-Z0-9]+)/);
        const id = match ? match[1] : null;
        if (id) {
            return `<iframe width="560" height="315" src="https://medal.tv/clip/${id}/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe>`;
        }
    }

    // Si no se pudo embeber correctamente, usar enlace directo
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">View Video</a>`;
}

// Otros utilitarios existentes
export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// Mezclar un arreglo aleatoriamente
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}
