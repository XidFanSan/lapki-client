import { State, InitialState, FinalState, ChoiceState } from '@renderer/lib/drawable';
import {
  Component as ComponentData,
  State as StateData,
  Transition as TransitionData,
  Note as NoteData,
} from '@renderer/types/diagram';

import { Component } from '../drawable/ComponentNode';

export interface ChangeComponentParams {
  name: string;
  parameters: ComponentData['parameters'];
  newName?: string;
}

export interface DeleteComponentParams {
  name: string;
  purge?: boolean;
}

export interface LinkStateParams {
  parentId: string;
  childId: string;

  // Поля ниже нужны для коректной отмены этого действия с помощью истории
  addOnceOff?: boolean;
  canBeInitial?: boolean;
}

export interface UnlinkStateParams {
  id: string;
}

export interface CCreateInitialStateParams {
  id?: string;
  targetId: string;
}

export interface DeleteInitialStateParams {
  id: string;
  targetId: string;
}

export const getStatesControllerDefaultData = () => {
  return {
    states: new Map<string, State>(),
    initialStates: new Map<string, InitialState>(),
    finalStates: new Map<string, FinalState>(),
    choiceStates: new Map<string, ChoiceState>(),
  } as const;
};

export type StatesControllerData = ReturnType<typeof getStatesControllerDefaultData>;

export type StatesControllerDataStateType = keyof StatesControllerData;
export type StateVariant = StatesControllerData[StatesControllerDataStateType] extends Map<
  unknown,
  infer T
>
  ? T
  : never;
export type StateType = StatesControllerDataStateType extends `${infer T}s` ? T : never;

export const getComponentsControllerDefaultData = () => {
  return {
    components: new Map<string, Component>(),
  } as const;
};

export type ComponentsControllerData = ReturnType<typeof getComponentsControllerDefaultData>;

export type ComponentsControllerDataComponentType = keyof ComponentsControllerData;
export type ComponentVariant =
  ComponentsControllerData[ComponentsControllerDataComponentType] extends Map<unknown, infer T>
    ? T
    : never;
export type ComponentType = ComponentsControllerDataComponentType extends `${infer T}s` ? T : never;

export type CopyData =
  | { type: 'state'; data: StateData & { id: string } }
  | { type: 'transition'; data: TransitionData & { id: string } }
  | { type: 'note'; data: NoteData & { id: string } }
  | { type: 'component'; data: ComponentData & { id: string } };
export type CopyType = CopyData['type'];
