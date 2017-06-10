import ATV from 'atvjs';

export const template = ({ message = 'Loading...' }) => `
<document>
    <loadingTemplate>
        <activityIndicator>
            <title>${message}</title>
        </activityIndicator>
    </loadingTemplate>
</document>
`;

export const name = 'loading';

const config = { name, template };
export default ATV.Page.create(config);
