  import React, { createContext } from 'react';
  import { createStore } from 'polotno/model/store';
  import { unstable_setAnimationsEnabled } from 'polotno/config';
  import { createProject } from '../../components/editor/project';
  import { ErrorBoundary } from 'react-error-boundary';
  // import App from '../../App';


  // Enable animations for a better user experience
  unstable_setAnimationsEnabled(true);

  // Create the Polotno store
  const store = createStore({ key: 'nFA5H9elEytDyPyvKL7T' });
  store.addPage();
  // window.store = store;

  // Create a project instance
  const project = createProject({ store });
  window.project = project;

  // Create a context to provide store and project globally
  export const PolotnoContext = createContext({ store, project });

  function Fallback({ error }) {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
          <p>Something went wrong in the app.</p>
          <p>Try to reload the page.</p>
          <p>If it does not work, clear cache and reload.</p>
          <button
            onClick={async () => {
              await project.clear();
              window.location.reload();
            }}
          >
            Clear cache and reload
          </button>
        </div>
      </div>
    );
  }

  const PolotnoEditorProvider = () => {
    return (
      <ErrorBoundary
        FallbackComponent={Fallback}
        onError={(e) => {
          if (window.Sentry) {
            window.Sentry.captureException(e);
          }
        }}
      >
        <PolotnoContext.Provider value={{ store, project }}>
          {/* <App store={store} /> */}
        </PolotnoContext.Provider>
      </ErrorBoundary>
    );
  };

  export default PolotnoEditorProvider;
