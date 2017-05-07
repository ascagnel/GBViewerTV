import ATV from 'atvjs';
import escape from 'escape-html';
import { getPath, prepareUrl } from '../common/fetch';
import GetAllProgressPromise from '../common/GetAllProgress';
import Video from '../Views/Video';

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
                        ${data.latest.map(Video).join('')}
                    </section>
                </grid>
            </collectionList>
        </stackTemplate>
    </document>
`;

export const name = 'home';

const getLatestVideosPromise = () => {
    return Promise.all([
        GetAllProgressPromise,
        ATV.Ajax.get(`${getPath('videos')}&limit=16`)
            .then(response => ({ latest: ATV._.get(response, 'response.results', []) })),
    ])
        .then(responses => {
            const { latest: results, savedTimes } = responses
                .reduce((prev, curr) => Object.assign({}, prev, curr), {});
            const latest = results.map(result => {
                const item = {
                    id: result.id,
                    detailUrl: ATV._.get(result, 'api_detail_url'),
                    name: escape(result.name),
                    description: escape(result.deck),
                    image: ATV._.get(result, 'image.screen_url')
                };

                if (savedTimes[item.id]) {
                    item.progress = ATV._.round(savedTimes[item.id].savedTime / result.length_seconds, 2);
                }

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
