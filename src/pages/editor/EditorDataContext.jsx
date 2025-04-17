import React, { createContext, useContext, useState } from 'react';

const EditorDataContext = createContext();

export const useEditorData = () => useContext(EditorDataContext);

export const EditorDataProvider = ({ children }) => {
    const initialValues = {
        type: '',
        name: '',
        desc: '',
        tags: [],
        colors: [
            {
                color: '',
                hex: '',
                templateImages: '',
                initialDetail: {},
            },
        ],
        size: '',
        templateType: '',
        templateTheme: '',
        orientation: '',
        count: 0,
        templatePhoto: false,
        isFavorite: false,
        isPremium: false,
    }
    const [editorData, setEditorData] = useState(null);
    const [templetImage, setTempletImage] = useState(null);
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [formData, setFormData] = useState(initialValues);

    return (
        <EditorDataContext.Provider value={{
            editorData, setEditorData,
            templetImage, setTempletImage,
            currentColorIndex, setCurrentColorIndex ,formData,setFormData,initialValues
        }}>
            {children}
        </EditorDataContext.Provider>
    );
};
