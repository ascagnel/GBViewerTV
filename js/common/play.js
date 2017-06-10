import ATV from 'atvjs';
import { getPath, prepareUrl } from './fetch';

const _timeEventHandlerGenerator = videoId => e => {
    const time = Math.floor(e.time);
    const url = `${getPath('video/save-time/')}&video_id=${videoId}&time_to_save=${time}&format=json`;
    ATV.Ajax.post(prepareUrl(url, { skipFormat: true }));
};

export const _play = ({ url, mediaType, resumeVideo, savedTime=0, image, title, description }) => {
    const video = new MediaItem(mediaType, prepareUrl(url));
    const playlist = new Playlist();

    if (image) {
        video.artworkImageURL = image;
    }

    if (title) {
        video.title = title;
    }

    if (description) {
        video.description = description;
    }

    playlist.push(video);

    const player = new Player();
    player.playlist = playlist;

    if (savedTime > 0 && resumeVideo) {
        player.seekToTime(savedTime);
    }

    player.play();
    return player;
};

export function play({
    url,
    mediaType='video',
    videoId,
    resumeVideo=true,
    image,
    title,
    description
}) {
    if (!videoId) {
        _play({ url, mediaType, resumeVideo: false, image, title, description });
        return;
    }
    ATV.Ajax.get(prepareUrl(`${getPath('/video/get-saved-time/')}&video_id=${videoId}`))
        .then(response => {
            const savedTime = Math.floor(ATV._.get(response, 'response.savedTime', -1));
            const player = _play({ url, mediaType, resumeVideo, savedTime, image, title, description });
            player.addEventListener('timeDidChange', _timeEventHandlerGenerator(videoId), { interval: 5 });
        });
};

export default play;

