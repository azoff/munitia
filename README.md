Munitia
=======

Running Locally
---------------
To run locally, you will need to provide an "environment.json" file as the only argument to the app entry point. This file mimics the data provided by the app in production. By default, git will ignore the file so that private data is not exposed in the repository. Once this is set up, you can run the API server locally by running the following command:

`node ./api-node/main.js path/to/environment.json`

You can then access the app at:

`http://localhost:8080`

To Do
-----
- Finish contribution prototype
- Persist model
- Handle invalid state entry points