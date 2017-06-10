import ATV from 'atvjs';
import { getPath, prepareUrl } from '../common/fetch';
import { parseString } from 'xml2js';

const template = data => `
<document>
    <alertTemplate>
        <title>Log in to GiantBomb</title>
        <description>
            Log in to http://www.giantbomb.com/app/gbviewertv/activate and enter the code below.
        </description>

        <title>${data.authCode}</title>
    </alertTemplate>
</document>
`;

const ready = (options, resolve, reject) => {
    const data = {};
    const code = Device.vendorIdentifier;
    ATV.Ajax.get(`https://www.giantbomb.com/app/gbviewertv/get-code?deviceID=${code}`, { responseType: 'xml' })
        .then(({ response }) => {
            parseString(response, (err, result) => {
                data.authCode = ATV._.get(result, 'result.regCode.0');
                resolve(data);
                const url = `http://www.giantbomb.com/app/gbviewertv/get-result?regCode=${data.authCode}&deviceID=${code}`;
                const intervalId = setInterval(() => {
                    ATV.Ajax.get(url, { responseType: 'xml' })
                        .then(response => {
                            parseString(response.response, (_err, _result) => {
                                const status = ATV._.get(_result, 'result.status.0', '');
                                const regCode = ATV._.get(_result, 'result.regToken.0', '');

                                if (status === 'success') {
                                    clearInterval(intervalId);
                                    ATV.Settings.set('apiKey', regCode);
                                    ATV.Navigation.clear();
                                    ATV.Navigation.navigate('home');
                                }
                            });
                        });
                }, 5000);
            });
        });
};

export default ATV.Page.create({
    template,
    name: 'login',
    ready
});
