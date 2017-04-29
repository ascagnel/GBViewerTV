import ATV from 'atvjs';
import { apiKey } from '../API_KEY';
console.log('apiKey', apiKey);

export const getPath = resource => {
    console.log('apiKey', apiKey);
    return `https://www.giantbomb.com/api/${resource}?api_key=${apiKey}&format=json`;
};

export const prepareUrl = input => {
    if (input.indexOf('?') === -1 && input.indexOf('apiKey=') === -1) {
        input = `${input}?api_key=${ATV.Settings.get('apiKey')}`;
    }

    if (input.indexOf('api_key=') === -1) {
        input = `${input}&api_key=${ATV.Settings.get('apiKey')}`;
    }

    if (input.indexOf('format=') === -1) {
        input = `${input}&format=json`;
    }

    return input;
};
