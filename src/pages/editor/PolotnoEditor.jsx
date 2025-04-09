import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Spinner } from '@blueprintjs/core';
import { useParams } from 'react-router-dom';

import {
  PolotnoContainer,
  SidePanelWrap,
  WorkspaceWrap
} from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { PagesTimeline } from 'polotno/pages-timeline';
import { setTranslations } from 'polotno/config';

// import { loadFileFromUrl } from '../../components/editor/file';
import { IconsSection } from '../../components/editor/sections/icons-section';
import { ShapesSection } from '../../components/editor/sections/shapes-section';
import { MyDesignsSection } from '../../components/editor/sections/my-designs-section';

import { useProject } from '../../components/editor/project';
import fr from '../../components/editor/translations/fr.json';
import en from '../../components/editor/translations/en.json';
import id from '../../components/editor/translations/id.json';
import ru from '../../components/editor/translations/ru.json';
import ptBr from '../../components/editor/translations/pt-br.json';
import zhCh from '../../components/editor/translations/zh-ch.json';

import Topbar from '../../components/editor/topbar/topbar';
import axiosInstance from '../../Instance';

setTranslations(en); // Default language

// Modify default sections
DEFAULT_SECTIONS.splice(3, 1, ShapesSection);
DEFAULT_SECTIONS.splice(3, 0, IconsSection);
DEFAULT_SECTIONS.unshift(MyDesignsSection);

const PolotnoEditor = observer(({ store }) => {
  const project = useProject();
  const { id } = useParams(); // Template ID from the route

  useEffect(() => {
    // Load translations
    const lang = project?.language?.toLowerCase();
    if (lang?.startsWith('fr')) setTranslations(fr, { validate: true });
    else if (lang?.startsWith('id')) setTranslations(id, { validate: true });
    else if (lang?.startsWith('ru')) setTranslations(ru, { validate: true });
    else if (lang?.startsWith('pt')) setTranslations(ptBr, { validate: true });
    else if (lang?.startsWith('zh')) setTranslations(zhCh, { validate: true });
    else setTranslations(en, { validate: true });
  }, [project?.language]);

  useEffect(() => {
    // Initialize store if needed
    if (store.pages.length === 0) {
      store.addPage();
    }
  }, [store]);

  useEffect(() => {
    if (!id) return;

    // Fetch the template details
    axiosInstance.get(`/api/template/${id}`)
      .then((res) => {
        const templateData = res.data.data;
        const selectedImage = templateData?.colors?.[0]?.templateImages;

        if (selectedImage) {
          const page = store.pages[0];
          page.addElement({
            type: 'image',
            src: selectedImage,
            width: 400,
            height: 400,
          });
        }
      })
      .catch((err) => console.error('Error loading template:', err));
  }, [id, store]);

  const handleDrop = (ev) => {
    ev.preventDefault();
    if (!ev.dataTransfer?.files) return;

    if (ev.dataTransfer.files.length !== ev.dataTransfer.items.length) return;
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFileFromUrl(ev.dataTransfer.files[i], store);
    }
  };

  if (!project) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spinner size={50} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
      onDrop={handleDrop}
    >
      <Topbar store={store} />
      <div style={{ height: 'calc(100% - 50px)' }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel store={store} sections={DEFAULT_SECTIONS} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar store={store} />
            <Workspace store={store} />
            <ZoomButtons store={store} />
            <PagesTimeline store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>

      {project.status === 'loading' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
          }}>
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
});

export default PolotnoEditor;
