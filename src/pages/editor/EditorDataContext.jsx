import React, { createContext, useContext, useState } from 'react';

const EditorDataContext = createContext();

export const useEditorData = () => useContext(EditorDataContext);

export const EditorDataProvider = ({ children }) => {
    const [editorData, setEditorData] = useState(null);
    const [templetImage, setTempletImage] = useState(null);

    return (
        <EditorDataContext.Provider value={{ editorData, setEditorData, templetImage, setTempletImage }}>
            {children}
        </EditorDataContext.Provider>
    );
};
