import ATV from 'atvjs';

export const getPath = resource => {
    const apiKey = ATV.Settings.get('apiKey');
    const leader = resource[0] === '/' ? '' : '/';
    return `https://www.giantbomb.com/api${leader}${resource}?api_key=${apiKey}&format=json`;
};

export const prepareUrl = (input, options = {}) => {
    if (input.indexOf('?') === -1 && input.indexOf('apiKey=') === -1) {
        input = `${input}?api_key=${ATV.Settings.get('apiKey')}`;
    }

    if (input.indexOf('api_key=') === -1) {
        input = `${input}&api_key=${ATV.Settings.get('apiKey')}`;
    }

    if (!options.skipFormat) {
        if (input.indexOf('format=') === -1) {
            input = `${input}&format=json`;
        }
    }

    return input;
};
