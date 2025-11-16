import { withAdapter } from '#imports';
import type { AdapterOptions } from '../../src/runtime/utils/withAdapter';

interface MyCustomAdapter extends AdapterOptions {
  data: boolean[];
  meta: {
    pagination: string[]
  };
  params: {
    isOk: boolean,
    isDanger: boolean,
  };
}

const MyCustomAdapter = withAdapter<MyCustomAdapter>((options) => ({
  default: () => [],
  immediate: false,
  method: 'GET',
  query: options,
  uri: '/users/octocat',
}));

export { MyCustomAdapter };
