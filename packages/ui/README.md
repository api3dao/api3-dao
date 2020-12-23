# API3 DAO UI
 
## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `deploy ipfs`

At the moment we are using [fleek](https://app.fleek.co/).
1.- Sign in with your github account.
2.- Select your github deployment branch
3.- Set `ENV_VARIABLES such as REACT_APP_NETWORK` you can find this in fleek deploy settings.
4.- Every time a `git push` is made to such "deployment branch" fleek would automatically deploy those changes to a new IPFS hash.

In the future we will also implement commands that allow users to deploy to ipfs thru command line.
