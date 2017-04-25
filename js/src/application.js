import ATV from 'atvjs';

import home from './pages/Home';
import mainMenu from './pages/MainMenu';

ATV.Navigation.navigate(home.name);
/*
App.onLaunch = function(options) {
    const templateParser = new DOMParser();
    const parsedTemplates = templates.map(template => {
        debugger;
        templateParser.parseFromString(template(), "application/xml");
    });
    navigationDocument.pushDocument(parsedTemplates[0]);
}
*/
