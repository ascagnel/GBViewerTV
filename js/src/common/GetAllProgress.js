import ATV from 'atvjs';
import { getPath, prepareUrl } from './fetch';

const GetAllProgress = ATV.Ajax.get(prepareUrl(getPath('video/get-all-saved-times/')))
    .then(response => ({
        savedTimes: ATV._.get(response, 'response.savedTimes', [])
            .reduce((prev, curr) => Object.assign({}, prev, { [curr.videoId]: curr }), {})
    }))

export default GetAllProgress;
