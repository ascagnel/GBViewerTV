import ATV from 'atvjs';

import Home from './pages/Home';
import Loader from './pages/Loading';
import Video from './pages/Video';
import Login from './pages/Login';
import Show from './pages/Show';
import Shows from './pages/Shows';

import { prepareUrl, getPath } from './common/fetch';

import { template as loaderTemplate } from './pages/Loading';

const errorTpl = (data) => {
    return `
        <document>
            <descriptiveAlertTemplate>
                <title>Error on Loading: ${data.title}</title>
                <description>${data.message}</description>
            </descriptiveAlertTemplate>
        </document>`;
};

let menuItems = [{
    id: 'live',
    name: 'Live!',
    page: null
}, {
    id: 'home',
    name: 'Latest',
    page: Home,
    attributes: {
        autoHighlight: true
    }
}, {
    id: 'shows',
    name: 'Shows',
    page: Shows
}, {
    id: 'games',
    name: 'Games',
    page: null
}];

ATV.start({
    templates: {
        loader: loaderTemplate,
        error: errorTpl
    },
    menu: {
        attributes: {},
        items: menuItems
    },
    onLaunch(options, resolve, reject) {
        const apiKey = ATV.Settings.get('apiKey');
        if (apiKey) {
            ATV.Navigation.navigateToMenuPage();
        } else {
            ATV.Navigation.navigate('login');
        }
    }
});
