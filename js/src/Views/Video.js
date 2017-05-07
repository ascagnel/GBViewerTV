const Video = item => {
    return `
        <lockup data-href-page="video" data-href-page-options='{ "detailUrl": "${item.detailUrl}", "video": "${item.video}" }'>
            <img src="${item.image}" width="340" height="192" />
            <title>${item.name}</title>
            ${item.progress ? `
            <overlay style="tv-position: footer">
                <progressBar value="${item.progress}" style="tv-position: footer" />
            </overlay>
            ` : ''}
        </lockup>
    `;
};

export default Video;
