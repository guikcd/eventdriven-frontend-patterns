const { CloudFormationClient, DescribeStacksCommand } = require("@aws-sdk/client-cloudformation");
const fs = require('fs');

async function generateConfig() {
    const region = process.env.AWS_DEFAULT_REGION;
    const client = new CloudFormationClient({region});
    const stackName = "patterns-eventdriven-frontends-shared";

    try {
        const command = new DescribeStacksCommand({
            StackName: stackName
        });
        
        const response = await client.send(command);
        const outputs = response.Stacks[0].Outputs;

        // Extract values from outputs
        const config = {
            region: region,
            identityPoolId: outputs.find(o => o.OutputKey === 'IdentityPoolId')?.OutputValue,
            sharedEndpoint: outputs.find(o => o.OutputKey === 'SharedApiEndpoint')?.OutputValue,
            pattern1: {
               endpoint: outputs.find(o => o.OutputKey === 'Pattern1GraphQLEndpoint')?.OutputValue,
            },
            pattern2: {
              endpoint: outputs.find(o => o.OutputKey === 'Pattern2GraphQLEndpoint')?.OutputValue,
            },
            pattern3: {
              wssEndpoint: outputs.find(o => o.OutputKey === 'Pattern3WebSocketEndpoint')?.OutputValue,
            },
            pattern4: {
              mqttEndpoint: outputs.find(o => o.OutputKey === 'Pattern4IoTEndpoint')?.OutputValue,
            },
            pattern5: {
              endpoint: outputs.find(o => o.OutputKey === 'Pattern5EventsEndpoint')?.OutputValue,
              apiKey: outputs.find(o => o.OutputKey === 'Pattern5EventsApiKey')?.OutputValue,
            },
            polling: {
              endpoint: outputs.find(o => o.OutputKey === 'SharedApiEndpoint')?.OutputValue,
            },
            //push: {
            //  applicationServerKey: "" // your public key for web push, see push pattern README for details
            //}
        };

        // Create the config file content
        const configContent = `const config = ${JSON.stringify(config, null, 2)};\nexport default config;`;

        // Write to file
        fs.writeFileSync('appconfig.js', configContent);
        console.log('appconfig.js has been generated successfully');

    } catch (error) {
        console.error('Error generating config:', error);
    }
}

generateConfig();
