import ATV from 'atvjs';
import Video from '../Views/Video';
import GetAllProgressPromise from '../common/GetAllProgress';
import { getPath, prepareUrl } from '../common/fetch';

export const template = data => `
    <document>
        <stackTemplate>
            <banner>
                <title>${data.title}</title>
            </banner>
            <collectionList>
                <grid>
                    <section>
                        ${data.videos.map(Video).join('')}
                    </section>
                </grid>
            </collectionList>
        </stackTemplate>
    </document>
`;

const ready = (options, resolve, reject) => {
    const showUrl = prepareUrl(options.detailUrl);
    const showListingUrl = `${getPath('videos')}&filter=video_show:${options.id}`;
    Promise.all([
        GetAllProgressPromise,
        // Get the show
        ATV.Ajax.get(showUrl)
            .then(response => {
                const show = ATV._.get(response, 'response.results', {});
                return { show };
            }),
        // Get the videos in that show
        ATV.Ajax.get(showListingUrl)
            .then(responses => {
                const videos = ATV._.get(responses, 'response.results', [])
                    .map(video => ({
                        id: video.id,
                        name: video.name,
                        image: ATV._.get(video, 'image.screen_url') || ATV._.get(video, 'image.medium_url'),
                        length: video.length_seconds,
                        detailUrl: video.api_detail_url
                    }));
                return { videos };
            })
    ])
        .then(responses => {
            const { videos, show, savedTimes } = responses
                .reduce((prev, curr) => Object.assign({}, prev, curr), {});
            const data = {
                title: show.title,
                videos: videos.map(video => {
                    if (savedTimes[video.id]) {
                        video.progress = ATV._.round(savedTimes[video.id].savedTime / video.length, 2);
                    }
                    return video;
                })
            };
            resolve(data);
        });
};

export const config = { template, ready, name: 'show' };
export default ATV.Page.create(config);
