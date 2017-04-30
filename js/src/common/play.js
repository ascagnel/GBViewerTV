import ATV from 'atvjs';
import { prepareUrl } from './fetch';

export const _getSavedTimeUrl = videoId => `http://www.giantbomb.com/api/video/get-saved-time/?video_id=${videoId}`;

const _timeEventHandlerGenerator = videoId => e => {
    const time = Math.floor(e.time);
    const url = `http://www.giantbomb.com/api/video/save-time/?video_id=${videoId}&time_to_save=${time}&format=json`;
    ATV.Ajax.post(prepareUrl(url, { skipFormat: true }))
        .then(response => {
            console.log('saved time response', response);
        });
};

export function play({ url, mediaType='video', videoId, resumeVideo=true }) {
    ATV.Ajax.get(prepareUrl(`http://www.giantbomb.com/api/video/get-saved-time/?video_id=${videoId}`))
        .then(response => {
            const savedTime = Math.floor(ATV._.get(response, 'response.savedTime', -1));
            const video = new MediaItem(mediaType, prepareUrl(url));
            const playlist = new Playlist();
            playlist.push(video);

            const player = new Player();
            player.playlist = playlist;

            if (savedTime > 0 || !resumeVideo) {
                player.seekToTime(savedTime);
            }

            player.play();
            
            player.addEventListener('timeDidChange', _timeEventHandlerGenerator(videoId), { interval: 5 });
        });
};

export default play;

