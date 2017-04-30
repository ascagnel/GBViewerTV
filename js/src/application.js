import ATV from 'atvjs';

import Home from './pages/Home';
import Loader from './pages/Loading';
import Video from './pages/Video';
import { template as loaderTemplate } from './pages/Loading';

const errorTpl = (data) => {
    return `
        <document>
            <descriptiveAlertTemplate>
                <title>${data.title}</title>
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
            ATV.Navigation.navigateToMenuPage();
        } else {
            // TODO handle auth process
        }
    }
});
