import ATV from 'atvjs';
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

export const ready = (options, resolve, reject) => {
    return Promise.all([
        GetAllProgressPromise,
        ATV.Ajax.get(`${getPath('videos')}&limit=60`)
            .then(response => ({ latest: ATV._.get(response, 'response.results', []) })),
    ])
        .then(responses => {
            const { latest: results, savedTimes } = responses
                .reduce((prev, curr) => Object.assign({}, prev, curr), {});
            const latest = results.map(result => {
                const item = {
                    id: result.id,
                    detailUrl: ATV._.get(result, 'api_detail_url'),
                    name: result.name,
                    description: result.deck,
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

            resolve({ latest });
        });
};

const config = { template, name, ready };
export default ATV.Page.create(config);
