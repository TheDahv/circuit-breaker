/**
 * @packageDocumentation
 * @module server/backend/templates
 */

import * as React from 'react'

import * as Page from '../src/app/pages/Admin'

/**
 * HomeProps describe the values the server should provide to this view at
 * render time to build the first static app experience.
 */
export interface HomeProps {
  /**
   * Should be the route prefix where the admin UI is hosted. This is used for
   * calling up any assets required by the server.
   */
  prefix: string
  dependencies: [string, boolean][]
}

/**
 * Admin template lets Circuit Breaker build the first view of the Admin server
 * on the back-end.
 *
 * It should render a static page that is still usable before the React web app
 * loads and boots.
 *
 * This file complements src/pages/Admin.tsx, and any changes to it should
 * ensure they complement what the web app needs to build once it boots.
 */
export const Admin = (props: HomeProps) => {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />

        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'
        />

        <link
          href='https://fonts.googleapis.com/icon?family=Material+Icons'
          rel='stylesheet'
        />
        <script src='https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js' />
        <title>Circuit Breaker Admin</title>
      </head>
      <body>
        <div id='app'>
          <Page.Admin dependencies={props.dependencies} />
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `window.circuitBreakerConfig = ${JSON.stringify({
              prefix: props.prefix
            })}`
          }}
        />

        <script src={`${props.prefix}/vendor/react/umd/react.development.js`} />
        <script
          src={`${props.prefix}/vendor/react-dom/umd/react-dom.development.js`}
        />
        <script src={`${props.prefix}/js/app.js`} />
      </body>
    </html>
  )
}
