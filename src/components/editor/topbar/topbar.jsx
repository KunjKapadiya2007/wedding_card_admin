import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Navbar, Alignment, Popover, Button } from '@blueprintjs/core';
import { Import, FloppyDisk } from '@blueprintjs/icons';
import styled from 'polotno/utils/styled';
import MdcCloudAlert from '@meronex/icons/mdc/MdcCloudAlert';
import MdcCloudCheck from '@meronex/icons/mdc/MdcCloudCheck';
import MdcCloudSync from '@meronex/icons/mdc/MdcCloudSync';
import { CloudWarning } from '../cloud-warning';
import { useNavigate } from 'react-router-dom'; 
import { useEditorData } from '../../../pages/editor/EditorDataContext';
import { useSearchParams } from 'react-router-dom';


const SaveButton = observer(({ store }) => {
  const navigate = useNavigate();
  const {
    setEditorData, setTempletImage,
    currentColorIndex , editorData, formData, setFormData
  } = useEditorData();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    if (editorData && Object.keys(editorData).length !== 0  && id) {
      store.loadJSON(editorData);
    }
  }, [editorData]);


  const handleSave = async () => {
    try {
      const json = await store.toJSON();
      const dataUrl = await store.toDataURL();

      setEditorData(json);
      setTempletImage(dataUrl);

      if (currentColorIndex !== null) {
        const updatedColors = [...formData.colors];
        updatedColors[currentColorIndex].initialDetail = json;
        updatedColors[currentColorIndex].templateImages = dataUrl;
        setFormData(prev => ({
          ...prev,
          colors: updatedColors,
        }));
      }

      // Navigate back to edit page with ID (edit mode) or new form
      const path = id ? `/template-form/${id}` : '/template-form';
      navigate(path);

      // Optional: Use toast/snackbar instead of alert
      alert(`Design saved for color index ${currentColorIndex}`);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  return (
      <Button
          icon={<FloppyDisk />}
          text="Save"
          intent="success"
          onClick={handleSave}
          style={{ marginRight: '10px' }}
      />
  );
});

const DownloadButton = observer(({ store }) => {
  const handleDownload = async () => {
    try {
      const dataUrl = await store.toDataURL();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'design.png';
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <Button
      icon={<Import />}
      text="Download"
      intent="primary"
      onClick={handleDownload}
    />
  );
});

const NavbarContainer = styled('div')`
  white-space: nowrap;
  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled('div')`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

const Status = observer(({ project }) => {
  const Icon = !project.cloudEnabled
    ? MdcCloudAlert
    : project.status === 'saved'
      ? MdcCloudCheck
      : MdcCloudSync;

  return (
    <Popover
      content={
        <div style={{ padding: '10px', maxWidth: '300px' }}>
          {!project.cloudEnabled && (
            <CloudWarning style={{ padding: '10px' }} />
          )}
          {project.cloudEnabled && project.status === 'saved' && (
            <>
              Your data is saved with{' '}
              <a href="https://puter.com" target="_blank" rel="noopener noreferrer">
                Puter.com
              </a>
            </>
          )}
          {project.cloudEnabled &&
            (project.status === 'saving' || project.status === 'has-changes') &&
            'Saving...'}
        </div>
      }
      interactionKind="hover"
    >
      <div style={{ padding: '0 5px' }}>
        <Icon className="bp5-icon" style={{ fontSize: '25px', opacity: 0.8 }} />
      </div>
    </Popover>
  );
});

const Topbar = observer(({ store }) => {
  const navigate = useNavigate();

  return (
    <NavbarContainer className="bp5-navbar">
      <NavInner>
        <Navbar.Group align={Alignment.LEFT}>
          <Button icon="arrow-left" text="Back" onClick={() => navigate(-1)} />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <SaveButton
            store={store}
          />
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});

export default Topbar;
