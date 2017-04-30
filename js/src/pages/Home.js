import ATV from 'atvjs';

import { getPath } from '../common/fetch';

export const template = data => `
    <document>
        <stackTemplate>
            <banner>
                <title>GiantBomb</title>
            </banner>
            <collectionList>
                <grid>
                    <header>
                        <title>Latest Videos</title>
                    </header>
                    <section>
                        ${data.latest.map(ItemTile).join('')}
                    </section>
                </grid>
            </collectionList>
        </stackTemplate>
    </document>
`;

export const name = 'home';

const ItemTile = item => {
    return `
        <lockup data-href-page="video" data-href-page-options='{ "detailUrl": "${item.detailUrl}", "video": "${item.video}" }'>
            <img src="${item.image}" width="340" height="192" />
            <title>${item.name}</title>
        </lockup>
    `;
};

const getLatestVideosPromise = () => {
    return ATV.Ajax.get(`${getPath('videos')}&limit=16`)
        .then(response => {
            const results = ATV._.get(response, 'response.results', []);

            const latest = results.map(result => {
                const item = {
                    detailUrl: ATV._.get(result, 'api_detail_url'),
                    name: result.name,
                    description: result.deck,
                    image: ATV._.get(result, 'image.screen_url')
                };

                if (result.hd_url) {
                    item.video = result.hd_url;
                } else if (result.high_url) {
                    item.video = result.high_url;
                } else {
                    item.video = result.low_url;
                }

                return item;
            });

            return { latest };
        });
};

const getStreamingVideoPromise = () => {
    return ATV.Ajax.get(getPath('video/current-live/'))
        .then(response => {
            const video = ATV._.get(response, 'response.video');
            let stream = null;

            if (video) {
                stream = video;
            }
            return { stream };
        });
};

export const ready = (options, resolve, reject) => {
    Promise.all([getLatestVideosPromise(), getStreamingVideoPromise()])
        .then(all => {
            const results = all.reduce((prev, curr) => Object.assign({}, prev, curr), {});
            if (results.stream) {
                results.latest.splice(-1);
                const livestream = {
                    name: `Live Now! ${results.stream.title}`,
                    image: results.stream.image,
                    video: results.stream.stream,
                    detailUrl: null
                };
                results.latest = [].concat([livestream], results.latest);
            }
            resolve(results);
        });
};

const config = { template, name, ready };
export default ATV.Page.create(config);
