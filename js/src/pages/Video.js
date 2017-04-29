import ATV from 'atvjs';
import { prepareUrl, getPath } from '../common/fetch';

const template = data => `
    <document>
        <productTemplate>
            <banner>
                <heroImg src="${data.image}" />
                <infoList>
                    ${createInfoListItems(data)}
                </infoList>
                <stack>
                    <title>${data.title}</title>
                    <row>
                        <text>Some text here</text>
                    </row>
                    <description>${data.subtitle}</description>
                    <row>
                        <buttonLockup>
                            <badge src="resource://button-preview/" />
                            <title>Play</title>
                        </buttonLockup>
                    </row>
                </stack>
            </banner>
            ${createShelves(data)}
        </productTemplate>
    </document>
`;

const createInfoListItems = ({ info = [] }) => info.map(item => `
    <info>
        <header>
            <title>${item.name}</title>
        </header>
        <text>${item.value}</text>
    </info>
`).join('');

const createShelves = ({ shelves = [] }) => shelves.map(shelf => `
    <shelf>
        <header>
            <title>${shelf.name}</title>
        </header>
        ${shelf.videos.map(video => `
            <section>
                <lockup data-href-page="video" data-href-page-options='{ "detailUrl": "${video.url}" }'>
                    <img src="${video.image}" width="340" height="192" />
                    <title>${video.name}</title>
                </lockup>
            </section>
        `).join('')}
    </shelf>
`).join('');

const Page = ATV.Page.create({
    name: 'video',
    template: template,
    ready(options = {}, resolve, reject) {
        ATV.Ajax.get(prepareUrl(options.detailUrl))
            .then(response => {
                const result = ATV._.get(response, 'response.results', {});
                const data = {
                    id: result.id,
                    title: result.name,
                    subtitle: result.deck,
                    video: result.low_url,
                    promises: [] // this gets used later for subsequent calls
                };

                let hours = Math.floor(result.length_seconds / 3600);
                let minutes = Math.floor(Math.floor(result.length_seconds % 3600) / 60);
                let seconds = result.length_seconds % 60;

                hours = hours < 1 ? '' : `${hours}:`;
                minutes = `${minutes < 10 ? '0' : ''}${minutes}:`;
                seconds = `${seconds < 10 ? '0' : ''}${seconds}`;

                data.info = [
                    { name: "Runtime", value: `${hours}${minutes}${seconds}` },
                    { name: "Published", value: result.publish_date },
                    { name: "Type", value: result.video_type },
                    { name: "Posted By", value: result.user }
                ]

                if (result.image) {
                    data.image = result.image.screen_url;
                }

                if (result.hd_url) {
                    data.video = result.hd_url;
                    data.isHD = true;
                } else if (result.high_url) {
                    data.video = result.high_url;
                }

                if (result.video_categories && result.video_categories.length) {
                    data.categories = result.video_categories.map(({ name, id }) => ({
                        name,
                        id,
                        type: 'video_categories'
                    }));
                }

                if (result.video_shows) {
                    data.shows = result.video_shows.map(({ name, id }) => ({
                        name,
                        id,
                        type: 'video_show'
                    }));
                }

                if (data.categories || data.shows) {
                    const promises = [].concat(data.shows, data.categories)
                        .filter(item => !!item)
                        .map(generateShowPromise);
                    Promise.all(promises)
                        .then(res => {
                            data.shelves = res;
                            resolve(data);
                        });
                } else {
                    resolve(data);
                }
            })
            .catch(e => {
                reject(e);
            });
    }
});

const generateShowPromise = ({ name, id, type }) => {
    const url = prepareUrl(`${getPath('videos')}&filter=${type}:${id}&limit=10`);

    return ATV.Ajax.get(url)
        .then((response) => {
            let videos = ATV._.get(response, 'response.results', []).map(video => {
                return {
                    url: video.api_detail_url,
                    name: video.name,
                    image: ATV._.get(video, 'image.screen_url')
                };
            });

            return { name, videos };
        })
        .catch(err => {
            throw err;
        });
};

export default Page;
