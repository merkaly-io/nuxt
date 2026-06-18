import { describe, expect, it } from 'vitest';
import { useDatagrid } from '../../../src/runtime/composables/useDatagrid';

describe('useDatagrid', () => {
  it('increments total when appending or prepending items', () => {
    const datagrid = useDatagrid<{ id: number }>({
      columns: {},
      items: [{ id: 1 }],
      total: 1,
    });

    datagrid.fn.addItem({ id: 2 });
    datagrid.fn.addItem({ id: 0 }, { mode: 'prepend' });

    expect(datagrid.items).toEqual([{ id: 0 }, { id: 1 }, { id: 2 }]);
    expect(datagrid.total).toBe(3);
  });

  it('decrements total only when an item is removed', () => {
    const datagrid = useDatagrid<{ id: number }>({
      columns: {},
      items: [{ id: 1 }, { id: 2 }],
      total: 2,
    });

    expect(datagrid.fn.removeItem(item => item.id === 3)).toBe(-1);
    expect(datagrid.total).toBe(2);

    expect(datagrid.fn.removeItem(item => item.id === 1)).toBe(0);
    expect(datagrid.items).toEqual([{ id: 2 }]);
    expect(datagrid.total).toBe(1);
  });

  it('does not decrement total below zero', () => {
    const datagrid = useDatagrid<{ id: number }>({
      columns: {},
      items: [{ id: 1 }],
    });

    datagrid.fn.removeItem(item => item.id === 1);

    expect(datagrid.total).toBe(0);
  });
});
