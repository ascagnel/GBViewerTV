import ATV from 'atvjs';
import escape from 'escape-html';
import Video from '../Views/Video';
import GetAllProgressPromise from '../common/GetAllProgress';
import { getPath, prepareUrl } from '../common/fetch';

export const template = data => `
    <document>
        <showcaseTemplate>
            <banner>
                <title>Shows</title>
            </banner>
            <carousel>
                <section>
                    ${data.shows.map(Show).join('')}
                </section>
            </carousel>
        </showcaseTemplate>
    </document>
`;

const Show = showData => `
<lockup data-href-page="show" data-href-page-options='{ "detailUrl": "${showData.detailUrl}", "id": "${showData.id}" }'>
    <img src="${showData.image}" />
    <title>${escape(showData.title)}</title>
</lockup>
`;

const ready = (options, resolve, reject) => {
    const showsUrl = `${getPath('video_shows')}&sort=position:asc&limit=20`;
    ATV.Ajax.get(prepareUrl(showsUrl))
        .then(response => {
            const shows = ATV._.get(response, 'response.results', []).map(show => ({
                detailUrl: show.api_detail_url,
                image: ATV._.get(show, 'image.super_url'),
                id: show.id,
                title: show.title
            }));
            resolve({ shows });
            return;
        });
};

export const config = { template, ready, name: 'shows' };
export default ATV.Page.create(config);
