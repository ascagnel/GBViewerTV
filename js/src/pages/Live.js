import ATV from 'atvjs';
import escape from 'escape-html';
import { getPath, prepareUrl } from '../common/fetch';
import GetAllProgressPromise from '../common/GetAllProgress';
import Video from '../Views/Video';
import play from '../common/play';

export const _nostream = () => `
<document>
    <alertTemplate>
        <title>No Live Stream</title>
        <description>Sorry, there's no live stream running right now.  Check back again later, or try reloading the app.</description>
        <button data-href-page-options='{ "refresh": true }'>
            <text>Reload App</text>
        </button>
    </alertTemplate>
</document>
`;

export const _streamWithImage = data => `
<document>
    <mainTemplate>
        <background>
            <img src="${data.image}" />
        </background>
        <menuBar>
            <section>
                <menuItem data-href-page-options='${JSON.stringify(data)}'>
                    <title>Live Now: ${data.title}</title>
                </menuItem>
            </section>
        </menuBar>
    </mainTemplate>
</document>
`;

export const _streamWithoutImage = data => `
<document>
    <alertTemplate>
        <title>${data.title}</title>
        <button data-href-page-options='${JSON.stringify(data)}'>
            <text>Play</text>
        </button>
    </alertTemplate>
</document>
`;

export const template = data => {
    console.log('data', data);
    if (!data.video) {
        return _nostream();
    } else if (data.image) {
        return _streamWithImage(data);
    } else {
        return _streamWithoutImage(data);
    }
};

export const ready = (options, resolve, reject) => {
    ATV.Ajax.get(getPath('video/current-live/'))
        .then(response => {
            const video = ATV._.get(response, 'response.video');
            const data = {};

            if (video) {
                data.title = escape(video.title);
                data.image = video.image;
                data.video = video.stream;
            }

            resolve(data);
        });
};

export const events = {
    select: 'onSelect'
};

export const onSelect = e => {
    console.log('onSelect', e);
    const target = e.target;
    if (target) {
        const options = JSON.parse(target.getAttribute('data-href-page-options'));
        if (options.refresh) {
            ATV.reload();
        } else {
            play({
                url: options.video,
                title: options.title,
                image: options.image
            });
        }
    }
};

export const config = { template, ready, name: 'live', events, onSelect };

export default ATV.Page.create(config);
