import ATV from 'atvjs';
import { prepareUrl } from '../common/fetch';

const template = data => `
    <document>
        <productTemplate>
            <banner>
                <heroImg src="${data.image}" />
                <infoList>
                    ${createInfoListItems(data.info)}
                </infoList>
                <stack>
                    <title>${data.title}</title>
                    <row>
                        <text>Some text here</text>
                    </row>
                    <description>${data.subtitle}</description>
                    <row>
                        <buttonLockup>
                            <badge src="resource://button-preview/" />
                            <title>Play</title>
                        </buttonLockup>
                    </row>
                </stack>
            </banner>
            <shelf>
                <header>
                    <title>Viewers Also Watched</title>
                </header>
                <section>
                    <lockup>
                        <img src="${data.image}" width="400" height="226" />
                        <title>Turn</title>
                    </lockup>
                </section>
            </shelf>
        </productTemplate>
    </document>
`;

const createInfoListItems = (items = []) => items.map(item => `
    <info>
        <header>
            <title>${item.name}</title>
        </header>
        <text>${item.value}</text>
    </info>
`).join('');

const Page = ATV.Page.create({
    name: 'video',
    template: template,
    ready(options = {}, resolve, reject) {
        ATV.Ajax.get(prepareUrl(options.detailUrl))
            .then(({ response }) => {
                const { results: result } = response;
                const data = {
                    title: result.name,
                    subtitle: result.deck,
                    video: result.low_url
                };


                let hours = Math.floor(result.length_seconds / 3600);
                let minutes = Math.floor(Math.floor(result.length_seconds % 3600) / 60);
                let seconds = result.length_seconds % 60;

                hours = hours == 0 ? '' : `${hours}:`;
                minutes = `${minutes < 10 ? '0' : ''}${minutes}:`;
                seconds = `${seconds < 10 ? '0' : ''}${seconds}`;

                data.info = [
                    { name: "Runtime", value: `${hours}:${minutes}:${seconds}` },
                    { name: "Type", value: result.video_type },
                    { name: "Posted By", value: result.user }
                ]

                if (result.image) {
                    data.image = result.image.screen_url;
                }

                if (result.hd_url) {
                    data.video = result.hd_url;
                    data.isHD = true;
                } else if (result.high_url) {
                    data.video = result.high_url;
                }

                if (result.video_categories && result.video_categories.length) {
                    data.shows = result.video_categories.map(({ name, api_detail_url}) => ({
                        name,
                        url: api_detail_url
                    }));
                }

                resolve(data);
            });
    }
});

export default Page;
