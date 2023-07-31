/**
 * Интерфейс, реализующий события, связанные с мышью.
 * Используется в {@link MouseEventEmitter}.
 */
export interface MyMouseEvent {
  x: number;
  y: number;
  dx: number;
  dy: number;
  left: boolean;
  stopPropagation: () => void;
  nativeEvent: MouseEvent;
}

/**
 * Обработчик {@link MyMouseEvent|«мышиных» событий}.
 * Используется в {@link MouseEventEmitter}.
 */
type Handler = (e: MyMouseEvent) => any;

/**
 * Система обработки событий специально для мыши.
 * Отличается от обычного EventEmitter возможностью отключить
 * вызов обработчиков событий на любом из шагов (stopPropagation).
 */
export class MouseEventEmitter {
  handlers = new Map<string, Set<Function>>();

  addEventListener(name: string, handler: Handler) {
    return this.on(name, handler);
  }

  on(name: string, handler: Handler) {
    if (!this.handlers.has(name)) {
      this.handlers.set(name, new Set());
    }

    this.handlers.get(name)?.add(handler);
  }

  off(name: string, handler: Handler) {
    if (!this.handlers.has(name)) {
      return;
    }

    const handlers = this.handlers.get(name);
    handlers?.delete(handler);

    if (handlers?.size === 0) {
      this.handlers.delete(name);
    }
  }

  emit(name: string, event: Omit<MyMouseEvent, 'stopPropagation'>) {
    if (this.handlers.has(name)) {
      const handlers = this.handlers.get(name);

      if (handlers) {
        let stop = false;

        (event as any).stopPropagation = () => {
          stop = true;
        };

        const arr = [...handlers.values()];

        for (let i = arr.length - 1; i >= 0; i--) {
          if (stop) break;

          arr[i](event);
        }
      }
    }
  }
}