import { Component } from 'vue';

export interface DialogConfig {
  width?: string;
  height?: string;
  title?: string;
  props?: Record<string, any>;
}

export interface DialogState {
  isOpen: boolean;
  component: Component | null;
  config: DialogConfig;
}
