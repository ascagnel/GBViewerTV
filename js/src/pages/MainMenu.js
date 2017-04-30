import ATV from 'atvjs';

export const template = data => `
    <document>
        <menuBarTemplate>
            <menuBar>
                <menuItem id="navigation_home" data-identifier="home">
                    <title>Home</title>
                </menuItem>
            </menuBar>
        </menuBarTemplate>
    </document>
`;

export const name = 'mainMenu';
export const data = {};

const config = { name, template, data };
ATV.Page.create(config);

export default config;
