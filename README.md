# AI chat application frontend

This is a frontend part of the application, also check out [backend](https://github.com/krglkvrmn/openai_api_ui_backend/tree/main)

## Tech stack

| Component               | Technology                                                   |
| ----------------------- | ------------------------------------------------------------ |
| Language                | [Typescript](https://www.typescriptlang.org/)                |
| Routing                 | [React Router v6](https://reactrouter.com/en/main)           |
| State management        | [Tanstack Query v3](https://tanstack.com/query/v3) + [preact signals](https://preactjs.com/guide/v10/signals/) |
| Styling                 | Pure CSS3 with [MUI inspired color palette](https://zenoo.github.io/mui-theme-creator/) |
| Build tool / dev server | [Vite](https://vitejs.dev/)                                  |

## Usage 🛠️

You need to have [node.js](https://nodejs.org/en/download/) installed

First, **clone the repository**

```bash
git clone git@github.com:krglkvrmn/openai_api_ui_frontend.git
# or
git clone https://github.com/krglkvrmn/openai_api_ui_frontend.git
```

**Go inside a repository directory**

```bash
cd openai_api_ui_frontend
```

**Install dependencies**

```bash
npm install
```

### Configuration 🎛️

Development and production configurations are controlled by env files `.env.development` and `.env.production`.

The active env file is determined by which mode we run vite in:

```bash
npx vite <other_arguments> --mode=development
# or
npx vite <other_arguments> --mode=production
```

`VITE_BACKEND_ORIGIN` is used to create URLs for backend API calls. Empty string (default for production mode) will result in creation of relative URLs and thus requests to the same origin from where JS files were served. In development, the backend origin is different, in such case we should specify it explicitly.

`VITE_CHAT_DEBUG_MODE_ENABLED` (`true | false`) - enables/disables interaction with an actual OpenAI API. When disabled (default in development configuration) backend will simulate streaming response messages and no API key required. When enabled, API key is required for an app to work and actual API calls to OpenAI are made.

### Development setup 🖥️

**Run vite web server**

```bash
npm run dev  # Application runs on port 3000 by default
# or
npx vite --port 3000  # Specify port explicitly
```

**Open a page in a browser** - http://localhost:3000

### Production setup 🚀

The app is designed to serve HTML, CSS, JS and other static files with NGINX, not vite server, this we only need to build our app.

```bash
npx vite build --mode=production
```

This will create files in a `dist` folder.

You can then upload these files to your server and configure NGINX or other server to serve them.



