import { apiKey } from '../API_KEY';
console.log('apiKey', apiKey);

export const getPath = resource => {
    console.log('apiKey', apiKey);
    return `https://www.giantbomb.com/api/${resource}?api_key=${apiKey}&format=json`;
};

export default (resource = 'videos') => {
    const path = getPath(resource);
    console.log('path', path);
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.send();

        const resonse = JSON.parse(xhr.response);
        console.log('response', response);
        resolve(response);
    });

};
