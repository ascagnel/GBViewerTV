import ATV from 'atvjs';
import escape from 'escape-html';
import { getPath, prepareUrl } from '../common/fetch';
import GetAllProgressPromise from '../common/GetAllProgress';
import Video from '../Views/Video';

export const template = data => `
    <document>
        <stackTemplate>
            <collectionList>
                <grid>
                    <header>
                        <title>Latest Game Releases</title>
                    </header>
                    <section>
                        ${data.latest.map(Video).join('')}
                    </section>
                </grid>
            </collectionList>
        </stackTemplate>
    </document>
`;

export const name = 'games';

export const ready = (options, resolve, reject) => {
    return Promise.all([
        GetAllProgressPromise,
        ATV.Ajax.get(`${getPath('games')}&limit=60&sort=original_release_date:desc`)
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

            resolve({ latest });
        });
};

const config = { template, name, ready };
export default ATV.Page.create(config);
