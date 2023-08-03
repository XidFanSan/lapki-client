import { useFloating, offset, flip, shift } from '@floating-ui/react';
import { Condition } from '@renderer/lib/drawable/Condition';
import { State } from '@renderer/lib/drawable/State';
import { Point } from '@renderer/types/graphics';
import { useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

export interface StateContextMenuData {
  data: State | Condition | null;
  position: Point;
}

interface StateContextMenuProps {
  isOpen: boolean;
  isData: StateContextMenuData | undefined;
  onClickDelState: (data) => void;
  onClickInitial: (data) => void;
  onClickDelTran: (data) => void;
  onClickShowCode: (data) => void;
  closeMenu: () => void;
}

export interface ContextMenu {
  id: string;
  content: string;
}

export const StateContextMenu: React.FC<StateContextMenuProps> = ({
  isOpen,
  isData,
  onClickInitial,
  onClickDelState,
  onClickDelTran,
  onClickShowCode,
  closeMenu,
}) => {
  const { handleSubmit: hookHandleSubmit } = useForm<ContextMenu>();

  const handleDeleteClick = hookHandleSubmit((data) => {
    closeMenu();
    if (typeof isData === 'undefined') return; // удалять нечего

    if (isData!.data instanceof Condition) {
      data.id = isData?.data.id!;
      onClickDelTran(data);
    }
    if (isData!.data instanceof State) {
      data.id = isData?.data.id!;
      onClickDelState(data);
    }
  });

  //отсылаем данные ноды для показа его кода
  const handleShowCode = hookHandleSubmit((data) => {
    console.log(['handleShowCode', isData]);
    if (typeof isData === 'undefined') return; // удалять нечего

    if (isData!.data === null) {
      data.id = 'FullCode';
      onClickShowCode(data);
    }

    if (isData!.data instanceof Condition) {
      data.id = isData?.data.transition.id!;
      data.content = JSON.stringify(isData.data, null, 2);
      onClickShowCode(data);
    }

    if (isData!.data instanceof State) {
      data.id = isData?.data.id!;
      data.content = JSON.stringify(isData.data, null, 2);
      onClickShowCode(data);
    }
  });

  //отсылаем id ноды для изменения начального состояния
  const handleInitialState = hookHandleSubmit((data) => {
    closeMenu();
    if (typeof isData === 'undefined') return; // удалять нечего
    if (!(isData!.data instanceof State)) return; // не нода
    data.id = isData?.data.id!;
    onClickInitial(data);
  });

  //Рисуем виртуальный объект
  const position = isData?.position ?? { x: 0, y: 0 };
  const x = position.x;
  const y = position.y;

  const virtualEl = {
    getBoundingClientRect() {
      return {
        width: 20,
        height: 20,
        x: 0,
        y: 0,
        top: y,
        left: x,
        right: 0,
        bottom: 0,
      };
    },
  };

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom',
    elements: {
      reference: virtualEl,
    },
    middleware: [offset(), flip(), shift({ padding: 5 })],
  });

  //Массив кнопок
  const button = [
    {
      text: 'Назначить начальным',
      onClick: handleInitialState,
      style: !(isData?.data instanceof State) && 'hidden',
      disabled:
        !(isData?.data instanceof State) || isData?.data.isInitial === true || !isData?.data.id,
    },
    {
      text: 'Посмотреть код',
      onClick: handleShowCode,
    },
    {
      text: 'Удалить',
      onClick: handleDeleteClick,
      style: !isData?.data && 'hidden',
    },
  ];

  return (
    <>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        key="ContextMenu"
        className={twMerge(
          'font z-50 w-56 rounded-lg bg-neutral-100 p-2 font-Fira text-base',
          !isOpen && 'hidden'
        )}
      >
        {button.map(({ text, onClick, style, disabled }, i) => (
          <button
            onClick={onClick}
            key={'ContextMenu' + i}
            disabled={disabled}
            className={twMerge(
              'w-full px-4 py-2 transition-colors hover:bg-red-600 hover:text-white disabled:text-gray-400',
              style
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </>
  );
};
