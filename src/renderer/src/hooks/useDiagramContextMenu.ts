import { useEffect, useState } from 'react';

import { CanvasEditor } from '@renderer/lib/CanvasEditor';
import { EditorManager } from '@renderer/lib/data/EditorManager';
import { useTabs } from '@renderer/store/useTabs';
import { Point } from '@renderer/types/graphics';

export type DiagramContextMenuItem = {
  label: string;
  type: string;
  isFolder?: boolean;
  children?: DiagramContextMenuItem[];
  action: () => void;
};

export const useDiagramContextMenu = (editor: CanvasEditor | null, manager: EditorManager) => {
  const openTab = useTabs((state) => state.openTab);

  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<DiagramContextMenuItem[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (!editor) return;

    const handleEvent = (pos: Point, items: DiagramContextMenuItem[]) => {
      const offset = editor.mouse.getOffset();
      const position = { x: pos.x + offset.x, y: pos.y + offset.y };

      setIsOpen(true);
      setPosition(position);
      setItems(items);
    };

    // контекстное меню для пустого поля
    editor.container.on('contextMenu', (pos) => {
      const canvasPos = editor.container.relativeMousePos(pos);

      handleEvent(pos, [
        {
          label: 'Вставить',
          type: 'paste',
          action: () => {
            editor?.container.handlePaste();
          },
        },
        {
          label: 'Вставить состояние',
          type: 'pasteState',
          action: () => {
            editor?.container.machine.createState({
              name: 'Состояние',
              position: canvasPos,
              placeInCenter: true,
            });
          },
        },
        {
          label: 'Посмотреть код',
          type: 'showCodeAll',
          action: () => {
            openTab({
              type: 'code',
              name: manager.data.name ?? 'Безымянная',
              code: manager.getDataSerialized(),
              language: 'json',
            });
          },
        },
        {
          label: 'Центрировать камеру',
          type: 'centerCamera',
          action: () => {
            editor?.container.viewCentering();
          },
        },
      ]);
    });

    // контекстное меню для состояния
    editor.container.states.on('stateContextMenu', ({ state, position }) => {
      const canvasPos = editor.container.relativeMousePos(position);

      handleEvent(position, [
        {
          label: 'Копировать',
          type: 'copy',
          action: () => {
            editor?.container.handleCopy();
          },
        },
        {
          label: 'Вставить',
          type: 'paste',
          action: () => {
            editor?.container.handlePaste();
          },
        },
        {
          label: 'Редактировать',
          type: 'edit',
          isFolder: true,
          children: [
            {
              label: 'Назначить начальным',
              type: 'initialState',
              action: () => {
                editor?.container.machine.changeInitialState(state.id as string);
              },
            },
            {
              label: 'Вставить состояние',
              type: 'pasteState',
              action: () => {
                editor?.container.machine.createState({
                  name: 'Состояние',
                  position: canvasPos,
                  parentId: state.id,
                });
              },
            },
          ],
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          action: () => {},
        },
        {
          label: 'Посмотреть код',
          type: 'showCodeAll',
          action: () => {
            openTab({
              type: 'state',
              name: state.data.name,
              code: manager.getStateSerialized(state.id) ?? '',
              language: 'json',
            });
          },
        },
        {
          label: 'Удалить',
          type: 'delete',
          action: () => {
            editor?.container.machine.deleteState(state.id as string);
          },
        },
      ]);
    });

    // контекстное меню для события
    editor.container.states.on('eventContextMenu', ({ state, position, event }) => {
      handleEvent(position, [
        {
          label: 'Удалить',
          type: 'delete',
          action: () => {
            editor?.container.machine.deleteEvent(state.id, event);
          },
        },
      ]);
    });

    // контекстное меню для связи
    editor.container.transitions.on('transitionContextMenu', ({ condition, position }) => {
      handleEvent(position, [
        {
          label: 'Копировать',
          type: 'copy',
          action: () => {
            editor?.container.handleCopy();
          },
        },
        // {
        //   label: 'Выбрать исход(source)',
        //   type: 'source',
        //   isFolder: true,
        //   children: [],
        //   // eslint-disable-next-line @typescript-eslint/no-empty-function
        //   action: () => {},
        // },
        // {
        //   label: 'Выбрать цель(target)',
        //   type: 'target',
        //   isFolder: true,
        //   children: [],
        //   // eslint-disable-next-line @typescript-eslint/no-empty-function
        //   action: () => {},
        // },
        {
          label: 'Посмотреть код',
          type: 'showCodeAll',
          action: () => {
            openTab({
              type: 'transition',
              name: condition.transition.id,
              code: manager.getTransitionSerialized(condition.transition.id) ?? '',
              language: 'json',
            });
          },
        },
        {
          label: 'Удалить',
          type: 'delete',
          action: () => {
            editor?.container.machine.deleteTransition(condition.id as string);
          },
        },
      ]);
    });
  }, [editor]);

  return { isOpen, onClose, items, position };
};
