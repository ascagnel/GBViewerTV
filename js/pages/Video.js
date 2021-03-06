import ATV from 'atvjs';
import { prepareUrl, getPath } from '../common/fetch';
import escape from 'escape-html';
import play from '../common/play';
import VideoTile from '../Views/Video';
import GetAllProgressPromise from '../common/GetAllProgress';

const template = data => `
    <document>
        <productTemplate>
            <banner>
                <heroImg src="${data.image}" />
                <infoList>
                    ${createInfoListItems(data)}
                </infoList>
                <stack>
                    <title>${escape(data.title)}</title>
                    <description>${escape(data.subtitle)}</description>
                    <row>
                        <buttonLockup data-href-page-options='{ "mediaUrl": "${data.video}", "videoId": "${data.id}", "title": "${data.title}", "description": "${data.subtitle}", "image": "${data.image}" }'>
                            <badge src="resource://button-play/" />
                            <title>Play</title>
                        </buttonLockup>
                        ${restartButton(data)}
                    </row>
                </stack>
            </banner>
            ${createShelves(data)}
        </productTemplate>
    </document>
`;

const restartButton = ({ video, id, hideRestart, title, subtitle, image }) => {
    if (hideRestart) {
        return '';
    }
    return `
        <buttonLockup data-href-page-options='{ "mediaUrl": "${video}", "videoId": "${id}", "restart": "false", "title": "${title}", "description": "${subtitle}", "image": "${image}" }'>
            <badge src="resource://button-preview/" />
            <title>Restart</title>
        </buttonLockup>
    `
};

const createInfoListItems = ({ info = [] }) => info.map(item => {
    const header = item.name ? `<header><title>${escape(item.name)}</title></header>` : '';
    let value;
    if (!item.type) {
        value = `<text>${escape(item.value)}</text>`;
    } else {
        const string = Object.keys(item).filter(key => (key !== 'type')).map(key => `${key}="${item[key]}"`).join(' ');
        value = `<${item.type} ${string} />`;
    }

    return `
        <info>
            ${header}
            ${value}
        </info>
    `;
}).join('');

const createShelves = ({ shelves = [] }) => shelves.map(shelf => `
    <shelf>
        <header>
            <title>${escape(shelf.name)}</title>
        </header>
        <section>
            ${shelf.videos.map(VideoTile).join('')}
        </section>
    </shelf>
`).join('');

const Page = ATV.Page.create({
    name: 'video',
    template: template,
    events: {
        select: 'onSelect'
    },
    onSelect(e) {
        const target = e.target;
        const page = target.getAttribute('data-href-page');
        const options = JSON.parse(target.getAttribute('data-href-page-options'));
        const resumeVideo = options.restart !== 'false';
        if (!page) {
            play({
                url: options.mediaUrl,
                videoId: options.videoId,
                resumeVideo,
                title: options.title,
                desciption: options.description,
                image: options.image
            });
            return;
        }
        return;
    },
    ready(options = {}, resolve, reject) {
        if (!options.detailUrl || options.detailUrl == "null") {
            play({ url: options.video });
            resolve();
            return;
        }
        return Promise.all([
            GetAllProgressPromise,
            ATV.Ajax.get(prepareUrl(options.detailUrl))
                .then(response => {
                    const result = ATV._.get(response, 'response.results', {});
                    const data = {
                        id: result.id,
                        title: result.name,
                        subtitle: result.deck,
                        video: result.low_url,
                        info: [],
                        row: [],
                        length: Math.floor(result.length_seconds),
                        promises: [] // this gets used later for subsequent calls
                    };

                    let hours = Math.floor(result.length_seconds / 3600);
                    let minutes = Math.floor(Math.floor(result.length_seconds % 3600) / 60);
                    let seconds = result.length_seconds % 60;

                    hours = hours < 1 ? '' : `${hours}:`;
                    minutes = `${minutes < 10 ? '0' : ''}${minutes}:`;
                    seconds = `${seconds < 10 ? '0' : ''}${seconds}`;


                    data.info.push({ name: "Runtime", value: `${hours}${minutes}${seconds}` });
                    data.info.push({ name: "Published", value: result.publish_date.split(' ')[0] });
                    data.info.push({ name: "Type", value: result.video_type });
                    data.info.push({ name: "Posted By", value: result.user });

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
                            name: name,
                            id,
                            type: 'video_categories'
                        }));
                    }

                    if (result.video_shows) {
                        data.shows = result.video_shows.map(({ name, id }) => ({
                            name: name,
                            id,
                            type: 'video_show'
                        }));
                    }
                    return { data };
                })
        ])
            .then(responses => {
                const { savedTimes, data } = responses.reduce((prev, curr) => Object.assign({}, prev, curr), {});
                data.savedTime = ATV._.get(savedTimes, `${data.id}.savedTime`, 0);
                if (data.savedTime < 0) {
                    data.savedTime = 0;
                    data.hideRestart = true;
                }
                if (data.categories || data.shows) {
                    const promises = [].concat(data.shows, data.categories)
                        .filter(item => !!item)
                        .map(generateShowPromise(savedTimes));
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
                console.log('e', e);
                reject(e);
            });
    }
});

const generateShowPromise = (savedTimes = {}) => ({ name, id, type }) => {
    const url = prepareUrl(`${getPath('videos')}&filter=${type}:${id}&limit=10`);

    return ATV.Ajax.get(url)
        .then((response) => {
            let videos = ATV._.get(response, 'response.results', []).map(video => {
                const item = {
                    id: video.id,
                    detailUrl: video.api_detail_url,
                    name: video.name,
                    image: ATV._.get(video, 'image.screen_url')
                };

                if (savedTimes[item.id]) {
                    item.progress = ATV._.round(savedTimes[item.id].savedTime / video.length_seconds, 2);
                }

                return item;
            });

            return { name, videos };
        })
        .catch(err => {
            throw err;
        });
};

export default Page;
