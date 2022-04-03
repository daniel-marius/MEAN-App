export const paths = {
  home: '',
  create: 'create',
  edit: 'edit',
  list: 'list',
  signin: 'signin',
  signup: 'signup',
};

export enum ContentState {
  LOADING,
  LOADED,
  ERROR,
}

type Loading = { state: ContentState.LOADING };
type Error = { state: ContentState.ERROR; error: string };
type Loaded<T> = { state: ContentState.LOADED; item: T };

type Rendered<T> = Loading | Error | Loaded<T>;
