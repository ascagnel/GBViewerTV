import ATV from 'atvjs';

import { getPath } from '../common/fetch';

export const url = `${getPath('videos')}&limit=22`;

export const template = data => `
    <document>
        <stackTemplate>
            <banner>
                <title>Home</title>
            </banner>
            <collectionList>
                <grid>
                    <header>
                        <title>Latest Videos</title>
                    </header>
                    <section>
                        ${data.latest.map(ItemTile).join('')}
                    </section>
                </grid>
            </collectionList>
        </stackTemplate>
    </document>
`;

export const name = 'home';

const ItemTile = item => {
    return `
        <lockup data-href-page="video" data-href-page-options='{ "detailUrl": "${item.detailUrl}" }'>
            <img src="${item.image}" width="340" height="192" />
            <title>${item.name}</title>
        </lockup>
    `;
};

export const data = response => {
    const results = ATV._.get(response, 'results', []);

    const latest = results.map(result => {
        const item = {
            detailUrl: ATV._.get(result, 'api_detail_url'),
            name: result.name,
            description: result.deck,
            image: ATV._.get(result, 'image.screen_url')
        };

        if (result.hd_url) {
            item.video = result.hd_url;
        } else if (result.high_url) {
            item.video = result.high_url;
        } else {
            item.video = result.low_url;
        }

        return item;
    });

    return { latest };
};

const config = { template, name, data, url };
export default ATV.Page.create(config);
