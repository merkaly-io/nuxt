import { withAdapter } from '#imports';

interface MyCustomAdapterParams {
  isOk: boolean,
  isDanger: boolean,
}

const MyCustomAdapter = withAdapter<MyCustomAdapterParams>((options) => ({
  default: () => [],
  immediate: false,
  method: 'GET',
  query: options,
  uri: '/users/octocat',
}));

export { MyCustomAdapter };
