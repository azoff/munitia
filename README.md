Munitia
=======

Running Locally
---------------
To run locally, you will need to include an environment.json file in the project root. This file
mimics the data provided by the app in production. By default, git will ignore the file so that private data is not exposed in the repository. Once this is set up, you can run the API server locally by running the following command:

`node ./api-node/main.js environment.json`