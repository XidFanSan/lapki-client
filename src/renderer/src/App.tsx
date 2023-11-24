import { useEffect, useState } from 'react';

import * as monaco from 'monaco-editor';
import DocumentTitle from 'react-document-title';

import {
  PlatformSelectModal,
  SaveRemindModal,
  ErrorModal,
  Sidebar,
  MainContainer,
} from '@renderer/components';
import { hideLoadingOverlay } from '@renderer/components/utils/OverlayControl';
import { useEditorManager, useErrorModal, useFileOperations } from '@renderer/hooks';
import { getColor } from '@renderer/theme';

import {
  getPlatformsErrors,
  preloadPlatforms,
  preparePreloadImages,
} from './lib/data/PlatformLoader';
import { preloadPicto } from './lib/drawable/Picto';
import { ThemeContext } from './store/ThemeContext';
import { Theme } from './types/theme';

/**
 * React-компонент приложения
 */
export const App: React.FC = () => {
  // TODO: а если у нас будет несколько редакторов?

  // Заголовок с названием файла,платформой и - Lapki IDE в конце
  const [title, setTitle] = useState<string>('Lapki IDE');

  const [theme, setTheme] = useState<Theme>('dark');

  const { editor, manager, setEditor } = useEditorManager();

  const name = manager.useData('name');
  const platformName = manager.useData('elements.platform');

  // FIXME: много, очень много модальных флажков, возможно ли сократить это обилие...
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const openPlatformModal = () => setIsPlatformModalOpen(true);
  const closePlatformModal = () => setIsPlatformModalOpen(false);

  const { errorModalProps, openLoadError, openPlatformError, openSaveError, openImportError } =
    useErrorModal();
  const { saveModalProps, operations, performNewFile } = useFileOperations({
    manager,
    openLoadError,
    openPlatformModal,
    openSaveError,
  });

  const handleChangeTheme = (theme: Theme) => {
    setTheme(theme);

    document.documentElement.dataset.theme = theme;

    monaco.editor.setTheme(getColor('codeEditorTheme').trim());

    if (editor) {
      editor.container.isDirty = true;
    }
  };

  useEffect(() => {
    preloadPlatforms(() => {
      preparePreloadImages();
      preloadPicto(() => void {});
      hideLoadingOverlay();

      const errs = getPlatformsErrors();
      if (Object.keys(errs).length > 0) {
        openPlatformError(errs);
      }
    });

    console.log(platformName);
    console.log(manager);
    console.log(editor);
  }, []);

  // Переименование вынес сюда из EditorManager.
  useEffect(() => {
    if (!name || !platformName) return;

    setTitle(`${name} [${platformName}] – Lapki IDE`);
  }, [name, platformName]);

  return (
    <DocumentTitle title={title}>
      <ThemeContext.Provider value={{ theme, setTheme: handleChangeTheme }}>
        <div className="h-screen select-none">
          <div className="flex h-full w-full flex-row overflow-hidden">
            <Sidebar
              manager={manager}
              editor={editor}
              callbacks={operations}
              openImportError={openImportError}
            />

            <MainContainer
              manager={manager}
              editor={editor}
              setEditor={setEditor}
              onRequestOpenFile={operations.onRequestOpenFile}
            />
          </div>

          <SaveRemindModal {...saveModalProps} />
          <ErrorModal {...errorModalProps} />
          <PlatformSelectModal
            isOpen={isPlatformModalOpen}
            onCreate={performNewFile}
            onClose={closePlatformModal}
          />
        </div>
      </ThemeContext.Provider>
    </DocumentTitle>
  );
};
