import ATV from 'atvjs';

import Home from './pages/Home';
import Loader from './pages/Loading';
import Video from './pages/Video';
import Login from './pages/Login';

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

ATV.start({
    templates: {
        loader: loaderTemplate,
        error: errorTpl
    },
    menu: {
        attributes: {},
        items: [{
            id: 'home',
            name: 'Home',
            page: Home
        }]
    },
    onLaunch(options) {
        const apiKey = ATV.Settings.get('apiKey');
        if (apiKey) {
            ATV.Navigation.navigate('home');
        } else {
            ATV.Navigation.navigate('login');
        }
    }
});
