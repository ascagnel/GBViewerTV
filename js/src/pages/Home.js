import ATV from 'atvjs';

import { getPath } from '../common/fetch';

export const url = `${getPath('videos')}&limit=10`;

export const template = data => {
    console.log('data', data);
    return `
        <document>
            <stackTemplate>
                <banner>
                    <title>Home</title>
                </banner>
                <collectionList>
                    <shelf>
                        <header>
                            <title>Latest Videos</title>
                        </header>
                        <section>
                            ${data.map(ItemTile).join('')}
                        </section>
                    </shelf>
                </collectionList>
            </stackTemplate>
        </document>
    `;
};

export const name = 'home';

const ItemTile = item => {
    return `
        <lockup>
            <title>${item.name}</title>
            <img src=${item.image} />
        </lockup>
    `;
};

export const data = response => {
    const results = ATV._.get(response, 'results', []);

    return results.map(result => {
        const item = {
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
};

const config = { template, name, data, url };
ATV.Page.create(config);

export default config
